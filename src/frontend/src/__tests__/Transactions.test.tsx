import { TransactionDetailPage } from "@/pages/TransactionDetail";
import { TransactionsPage } from "@/pages/Transactions";
import { screen, waitFor } from "@testing-library/react";
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

const TOP_UP = {
  at: 1_700_000_000_000_000_000n,
  id: 1n,
  status: "completed",
  owner: null as never,
  kind: "topUp" as never,
  reference: "TOPUP-1",
  counterparty: "Wallet top-up",
  amount: 5_000n,
};

const DATA_PURCHASE = {
  at: 1_700_000_100_000_000_000n,
  id: 2n,
  status: "completed",
  owner: null as never,
  kind: "dataPurchase" as never,
  reference: "DATA-2",
  counterparty: "08031234567",
  amount: 1_000n,
};

describe("TransactionsPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("lists every transaction kind", async () => {
    mockState.actor = createMockActor({
      listTransactions: async () => [TOP_UP, DATA_PURCHASE],
    });

    renderWithProviders([
      { path: "/", component: TransactionsPage },
      { path: "/transactions/$id", component: TransactionDetailPage },
    ]);

    expect(await screen.findByText("Wallet top-up")).toBeInTheDocument();
    expect(await screen.findByText("08031234567")).toBeInTheDocument();
    expect(screen.getByText("2 entries")).toBeInTheDocument();
  });

  it("filters transactions by type", async () => {
    const user = userEvent.setup();
    const listTransactions = vi.fn(async (filter: { kind?: unknown }) =>
      filter.kind ? [DATA_PURCHASE] : [TOP_UP, DATA_PURCHASE],
    );
    mockState.actor = createMockActor({ listTransactions });

    renderWithProviders([
      { path: "/", component: TransactionsPage },
      { path: "/transactions/$id", component: TransactionDetailPage },
    ]);

    await screen.findByText("Wallet top-up");
    await user.click(screen.getByRole("tab", { name: /^data$/i }));

    await waitFor(() => {
      expect(screen.queryByText("Wallet top-up")).not.toBeInTheDocument();
    });
    expect(screen.getByText("08031234567")).toBeInTheDocument();
  });

  it("searches transactions by phone number", async () => {
    const user = userEvent.setup();
    const listTransactions = vi.fn(async (filter: { search?: string }) =>
      filter.search ? [DATA_PURCHASE] : [TOP_UP, DATA_PURCHASE],
    );
    mockState.actor = createMockActor({ listTransactions });

    renderWithProviders([
      { path: "/", component: TransactionsPage },
      { path: "/transactions/$id", component: TransactionDetailPage },
    ]);

    await screen.findByText("Wallet top-up");
    await user.type(screen.getByLabelText(/search/i), "08031234567");

    await waitFor(() => {
      expect(listTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ search: "08031234567" }),
      );
    });
  });

  it("opens a transaction detail view from the list", async () => {
    const user = userEvent.setup();
    mockState.actor = createMockActor({
      listTransactions: async () => [TOP_UP],
      getTransaction: async () => TOP_UP,
    });

    renderWithProviders(
      [
        { path: "/", component: TransactionsPage },
        { path: "/transactions/$id", component: TransactionDetailPage },
      ],
      "/",
    );

    await user.click(await screen.findByText("Wallet top-up"));

    expect(await screen.findByText("Transaction detail")).toBeInTheDocument();
    expect(await screen.findByText("TOPUP-1")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
  });
});
