import { AdminPage } from "@/pages/Admin";
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

describe("AdminPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("denies a non-admin account", async () => {
    mockState.actor = createMockActor({ isCallerAdmin: async () => false });

    renderWithProviders([{ path: "/", component: AdminPage }]);

    expect(
      await screen.findByText(/admin access required/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/catalog & orders/i)).not.toBeInTheDocument();
  });

  it("shows the console to an admin", async () => {
    mockState.actor = createMockActor({
      isCallerAdmin: async () => true,
      listDataBundles: async () => [
        {
          id: 1n,
          provider: "mtn" as never,
          name: "1GB Monthly",
          validityDays: 30n,
          enabled: true,
          dataVolumeMb: 1024n,
          price: 1_000n,
        },
      ],
      listBillers: async () => [
        {
          id: 1n,
          name: "Ikeja Electric",
          enabled: true,
          category: "electricity" as never,
        },
      ],
    });

    renderWithProviders([{ path: "/", component: AdminPage }]);

    expect(await screen.findByText(/catalog & orders/i)).toBeInTheDocument();
    expect(await screen.findByText(/1GB Monthly/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /new bundle/i }),
    ).toBeInTheDocument();
  });
});
