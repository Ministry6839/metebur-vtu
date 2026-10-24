import { WalletPage } from "@/pages/Wallet";
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

describe("WalletPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("shows the current balance and ledger entries", async () => {
    mockState.actor = createMockActor({
      getMyWallet: async () => ({
        balance: 12_500n,
        owner: null as never,
        createdAt: 0n,
      }),
      getMyLedger: async () => [
        {
          at: 1_700_000_000_000_000_000n,
          id: 1n,
          owner: null as never,
          kind: "credit" as never,
          amount: 12_500n,
          reason: "Wallet top-up",
        },
      ],
    });

    renderWithProviders([{ path: "/", component: WalletPage }]);

    expect(await screen.findByText("₦125.00")).toBeInTheDocument();
    expect(await screen.findByText("Wallet top-up")).toBeInTheDocument();
  });

  it("tops up the wallet and reflects the new balance", async () => {
    const user = userEvent.setup();
    let balance = 0n;
    const topUpWallet = vi.fn(async (amount: bigint) => {
      balance += amount;
      return {
        at: 0n,
        id: 1n,
        owner: null as never,
        kind: "credit" as never,
        amount,
        reason: "Wallet top-up",
      };
    });

    mockState.actor = createMockActor({
      getMyWallet: async () => ({
        balance,
        owner: null as never,
        createdAt: 0n,
      }),
      getMyLedger: async () => [],
      topUpWallet,
    });

    renderWithProviders([{ path: "/", component: WalletPage }]);

    await user.type(await screen.findByLabelText(/amount/i), "500");
    await user.click(screen.getByRole("button", { name: /add funds/i }));

    await waitFor(() => {
      expect(topUpWallet).toHaveBeenCalledWith(50_000n);
    });
    expect(await screen.findByText("₦500.00")).toBeInTheDocument();
  });

  it("rejects a zero amount without calling the backend", async () => {
    const topUpWallet = vi.fn();
    mockState.actor = createMockActor({ topUpWallet });

    renderWithProviders([{ path: "/", component: WalletPage }]);

    const button = await screen.findByRole("button", { name: /add funds/i });
    expect(button).toBeDisabled();
    expect(topUpWallet).not.toHaveBeenCalled();
  });
});
