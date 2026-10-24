import { DashboardPage } from "@/pages/Dashboard";
import { screen } from "@testing-library/react";
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

describe("DashboardPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("renders the default route with the wallet balance and quick actions", async () => {
    mockState.actor = createMockActor({
      getMyWallet: async () => ({
        balance: 12_500n,
        owner: null as never,
        createdAt: 0n,
      }),
    });

    renderWithProviders([{ path: "/", component: DashboardPage }]);

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(await screen.findByText("₦125.00")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /top up wallet/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /buy data/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /pay a bill/i }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there is no activity", async () => {
    mockState.actor = createMockActor();

    renderWithProviders([{ path: "/", component: DashboardPage }]);

    expect(await screen.findByText("No activity yet")).toBeInTheDocument();
  });

  it("lists recent activity from the ledger and orders", async () => {
    mockState.actor = createMockActor({
      getMyWallet: async () => ({
        balance: 5_000n,
        owner: null as never,
        createdAt: 0n,
      }),
      getMyLedger: async () => [
        {
          at: 1_700_000_000_000_000_000n,
          id: 1n,
          owner: null as never,
          kind: "credit" as never,
          amount: 5_000n,
          reason: "Card deposit",
        },
      ],
      listMyDataOrders: async () => [
        {
          at: 1_700_000_100_000_000_000n,
          id: 2n,
          status: "completed" as never,
          provider: "MTN",
          owner: null as never,
          recipient: "08031234567",
          reference: "DATA-2",
          bundleName: "1GB Monthly",
          bundleId: 1n,
          amount: 1_000n,
        },
      ],
    });

    renderWithProviders([{ path: "/", component: DashboardPage }]);

    expect(await screen.findByText("Wallet top-up")).toBeInTheDocument();
    expect(await screen.findByText("Card deposit")).toBeInTheDocument();
    expect(await screen.findByText("MTN data bundle")).toBeInTheDocument();
    expect(screen.getByText("₦10.00")).toBeInTheDocument();
  });
});
