import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

const alice = createIdentity("alice");
const bob = createIdentity("bob");

/** The declarations type every filter field as `[] | [T]`, not optional. */
const EMPTY_FILTER = { to: [], from: [], kind: [], search: [] } as const;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  actor.setIdentity(alice);
  await expect(actor.getMyWallet()).resolves.toMatchObject({ balance: 0n });
  await expect(actor.getMyLedger()).resolves.toEqual([]);
  await expect(actor.listMyDataOrders()).resolves.toEqual([]);
  await expect(actor.listMyBillPayments()).resolves.toEqual([]);
  await expect(actor.listTransactions(EMPTY_FILTER)).resolves.toEqual([]);
  await expect(actor.listDataBundles()).resolves.toEqual([]);
  await expect(actor.listBillers()).resolves.toEqual([]);
});

it("tops up the wallet and reflects the balance in the ledger", async () => {
  actor.setIdentity(alice);
  const entry = await actor.topUpWallet(5_000n);
  expect(entry).toMatchObject({ kind: { credit: null }, amount: 5_000n });

  const wallet = await actor.getMyWallet();
  expect(wallet.balance).toBe(5_000n);

  const ledger = await actor.getMyLedger();
  expect(ledger).toHaveLength(1);
  expect(ledger[0]).toMatchObject({ amount: 5_000n, kind: { credit: null } });
});

it("rejects a zero top-up", async () => {
  actor.setIdentity(alice);
  await expect(actor.topUpWallet(0n)).rejects.toThrow();
});

it("lets an admin create a bundle and a biller, then lists them publicly", async () => {
  actor.setIdentity(alice);
  await actor._initialize_access_control();
  await actor.assignCallerUserRole(alice.getPrincipal(), { admin: null });
  await expect(actor.isCallerAdmin()).resolves.toBe(true);

  const bundle = await actor.createDataBundle(
    { mtn: null },
    "1GB Monthly",
    1024n,
    30n,
    1_000n,
  );
  expect(bundle).toMatchObject({ name: "1GB Monthly", price: 1_000n });

  const biller = await actor.createBiller({ electricity: null }, "Ikeja Electric");
  expect(biller).toMatchObject({ name: "Ikeja Electric" });

  await expect(actor.listDataBundles()).resolves.toContainEqual(
    expect.objectContaining({ id: bundle.id, name: "1GB Monthly" }),
  );
  await expect(actor.listBillers()).resolves.toContainEqual(
    expect.objectContaining({ id: biller.id, name: "Ikeja Electric" }),
  );
});

it("purchases a data bundle and debits the wallet", async () => {
  actor.setIdentity(alice);
  const bundles = await actor.listDataBundles();
  const bundle = bundles.find((item) => item.name === "1GB Monthly");
  expect(bundle).toBeDefined();

  const before = (await actor.getMyWallet()).balance;
  const result = await actor.purchaseDataBundle(bundle!.id, "08031234567");
  expect("ok" in result).toBe(true);
  if (!("ok" in result)) return;
  expect(result.ok).toMatchObject({
    recipient: "08031234567",
    amount: bundle!.price,
    status: { completed: null },
  });

  const after = (await actor.getMyWallet()).balance;
  expect(after).toBe(before - bundle!.price);

  const orders = await actor.listMyDataOrders();
  expect(orders).toContainEqual(
    expect.objectContaining({ id: result.ok.id, status: { completed: null } }),
  );
});

it("pays a bill and debits the wallet", async () => {
  actor.setIdentity(alice);
  const billers = await actor.listBillers();
  const biller = billers.find((item) => item.name === "Ikeja Electric");
  expect(biller).toBeDefined();

  const before = (await actor.getMyWallet()).balance;
  const result = await actor.payBill(biller!.id, "04512345678", 500n);
  expect("ok" in result).toBe(true);
  if (!("ok" in result)) return;
  expect(result.ok).toMatchObject({
    customerNumber: "04512345678",
    amount: 500n,
    status: { completed: null },
  });

  const after = (await actor.getMyWallet()).balance;
  expect(after).toBe(before - 500n);

  const payments = await actor.listMyBillPayments();
  expect(payments).toContainEqual(
    expect.objectContaining({ id: result.ok.id, status: { completed: null } }),
  );
});

it("lists every transaction kind and opens one by id", async () => {
  actor.setIdentity(alice);
  const transactions = await actor.listTransactions(EMPTY_FILTER);
  const kinds = transactions.map((tx) => Object.keys(tx.kind)[0]);
  expect(kinds).toContain("topUp");
  expect(kinds).toContain("dataPurchase");
  expect(kinds).toContain("billPayment");

  const first = transactions[0];
  const detail = await actor.getTransaction(first.id);
  expect(detail).toHaveLength(1);
  expect(detail[0]).toMatchObject({ id: first.id, reference: first.reference });
});

it("filters transactions by kind and search term", async () => {
  actor.setIdentity(alice);
  const searched = await actor.listTransactions({
    ...EMPTY_FILTER,
    search: ["08031234567"],
  });
  expect(searched.length).toBeGreaterThan(0);
  expect(searched.every((tx) => tx.counterparty.includes("08031234567"))).toBe(
    true,
  );

  const topUps = await actor.listTransactions({
    ...EMPTY_FILTER,
    kind: [{ topUp: null }],
  });
  expect(topUps.length).toBeGreaterThan(0);
  expect(topUps.every((tx) => "topUp" in tx.kind)).toBe(true);
});

it("rejects a purchase for an unknown bundle", async () => {
  actor.setIdentity(bob);
  const result = await actor.purchaseDataBundle(9_999n, "08031234567");
  expect("err" in result).toBe(true);
  if (!("err" in result)) return;
  expect(result.err).toMatchObject({ notFound: null });
});

it("does not show one caller's wallet or transactions to another", async () => {
  actor.setIdentity(bob);
  await expect(actor.getMyLedger()).resolves.toEqual([]);
  await expect(actor.listTransactions(EMPTY_FILTER)).resolves.toEqual([]);
  await expect(actor.listMyDataOrders()).resolves.toEqual([]);
});

it("rejects a non-admin from managing the catalog", async () => {
  // Register bob as a plain user so the access-control layer knows him.
  actor.setIdentity(alice);
  await actor.assignCallerUserRole(bob.getPrincipal(), { user: null });

  actor.setIdentity(bob);
  await expect(actor.isCallerAdmin()).resolves.toBe(false);
  await expect(
    actor.createDataBundle({ glo: null }, "Sneaky", 1n, 1n, 1n),
  ).rejects.toThrow();
  await expect(actor.listAllDataOrders()).rejects.toThrow();
  await expect(actor.listAllBillPayments()).rejects.toThrow();
});

it("rejects an anonymous caller", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.getMyWallet()).rejects.toThrow();
  await expect(guest.listTransactions(EMPTY_FILTER)).rejects.toThrow();
});
