import { BillsPage } from "@/pages/Bills";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockState,
  renderWithProviders,
  resetMockState,
} from "./test-utils";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfrastructureMock } = await import("./test-utils");
  return coreInfrastructureMock();
});

const ELECTRICITY_BILLER = {
  id: 1n,
  name: "Ikeja Electric",
  enabled: true,
  category: "electricity" as never,
};

const CABLE_BILLER = {
  id: 2n,
  name: "DSTV",
  enabled: true,
  category: "cableTv" as never,
};

describe("BillsPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("lists billers for the selected category only", async () => {
    const user = userEvent.setup();
    mockState.actor = createMockActor({
      listBillers: async () => [ELECTRICITY_BILLER, CABLE_BILLER],
      getMyWallet: async () => ({
        balance: 10_000n,
        owner: null as never,
        createdAt: 0n,
      }),
    });

    renderWithProviders([{ path: "/", component: BillsPage }]);

    expect(await screen.findByText("Ikeja Electric")).toBeInTheDocument();
    expect(screen.queryByText("DSTV")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /cable tv/i }));

    expect(await screen.findByText("DSTV")).toBeInTheDocument();
    expect(screen.queryByText("Ikeja Electric")).not.toBeInTheDocument();
  });

  it("pays a bill with a customer number and amount", async () => {
    const user = userEvent.setup();
    const payBill = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: {
        at: 0n,
        id: 5n,
        status: "completed" as never,
        billerName: "Ikeja Electric",
        customerNumber: "04512345678",
        owner: null as never,
        reference: "BILL-5",
        billerId: 1n,
        category: "Electricity",
        amount: 2_000n,
      },
    }));

    mockState.actor = createMockActor({
      listBillers: async () => [ELECTRICITY_BILLER],
      getMyWallet: async () => ({
        balance: 10_000n,
        owner: null as never,
        createdAt: 0n,
      }),
      payBill,
    });

    renderWithProviders([{ path: "/", component: BillsPage }]);

    await user.click(await screen.findByRole("button", { name: /pay bill/i }));
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/customer \/ meter number/i),
      "04512345678",
    );
    await user.type(within(dialog).getByLabelText(/amount/i), "20");
    await user.click(
      within(dialog).getByRole("button", { name: /confirm payment/i }),
    );

    await waitFor(() => {
      expect(payBill).toHaveBeenCalledWith(1n, "04512345678", 2_000n);
    });
  });

  it("blocks a payment with a short customer number", async () => {
    const user = userEvent.setup();
    const payBill = vi.fn();
    mockState.actor = createMockActor({
      listBillers: async () => [ELECTRICITY_BILLER],
      getMyWallet: async () => ({
        balance: 10_000n,
        owner: null as never,
        createdAt: 0n,
      }),
      payBill,
    });

    renderWithProviders([{ path: "/", component: BillsPage }]);

    await user.click(await screen.findByRole("button", { name: /pay bill/i }));
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/customer \/ meter number/i),
      "12",
    );
    await user.type(within(dialog).getByLabelText(/amount/i), "20");
    await user.click(
      within(dialog).getByRole("button", { name: /confirm payment/i }),
    );

    expect(
      await within(dialog).findByText(/valid customer or meter number/i),
    ).toBeInTheDocument();
    expect(payBill).not.toHaveBeenCalled();
  });
});
