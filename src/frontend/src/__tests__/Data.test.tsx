import { DataPage } from "@/pages/Data";
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

const MTN_BUNDLE = {
  id: 1n,
  provider: "mtn" as never,
  name: "1GB Monthly",
  validityDays: 30n,
  enabled: true,
  dataVolumeMb: 1024n,
  price: 1_000n,
};

const GLO_BUNDLE = {
  id: 2n,
  provider: "glo" as never,
  name: "2GB Weekly",
  validityDays: 7n,
  enabled: true,
  dataVolumeMb: 2048n,
  price: 1_500n,
};

describe("DataPage", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("lists bundles for the selected network only", async () => {
    const user = userEvent.setup();
    mockState.actor = createMockActor({
      listDataBundles: async () => [MTN_BUNDLE, GLO_BUNDLE],
      getMyWallet: async () => ({
        balance: 10_000n,
        owner: null as never,
        createdAt: 0n,
      }),
    });

    renderWithProviders([{ path: "/", component: DataPage }]);

    expect(await screen.findByText("1GB Monthly")).toBeInTheDocument();
    expect(screen.queryByText("2GB Weekly")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Glo" }));

    expect(await screen.findByText("2GB Weekly")).toBeInTheDocument();
    expect(screen.queryByText("1GB Monthly")).not.toBeInTheDocument();
  });

  it("purchases a bundle for a valid phone number", async () => {
    const user = userEvent.setup();
    const purchaseDataBundle = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: {
        at: 0n,
        id: 9n,
        status: "completed" as never,
        provider: "MTN",
        owner: null as never,
        recipient: "08031234567",
        reference: "DATA-9",
        bundleName: "1GB Monthly",
        bundleId: 1n,
        amount: 1_000n,
      },
    }));

    mockState.actor = createMockActor({
      listDataBundles: async () => [MTN_BUNDLE],
      getMyWallet: async () => ({
        balance: 10_000n,
        owner: null as never,
        createdAt: 0n,
      }),
      purchaseDataBundle,
    });

    renderWithProviders([{ path: "/", component: DataPage }]);

    await user.click(await screen.findByRole("button", { name: /^buy$/i }));

    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/recipient phone number/i),
      "08031234567",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /confirm purchase/i }),
    );

    await waitFor(() => {
      expect(purchaseDataBundle).toHaveBeenCalledWith(1n, "08031234567");
    });
  });

  it("blocks a purchase with an invalid phone number", async () => {
    const user = userEvent.setup();
    const purchaseDataBundle = vi.fn();
    mockState.actor = createMockActor({
      listDataBundles: async () => [MTN_BUNDLE],
      getMyWallet: async () => ({
        balance: 10_000n,
        owner: null as never,
        createdAt: 0n,
      }),
      purchaseDataBundle,
    });

    renderWithProviders([{ path: "/", component: DataPage }]);

    await user.click(await screen.findByRole("button", { name: /^buy$/i }));
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/recipient phone number/i),
      "123",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /confirm purchase/i }),
    );

    expect(
      await within(dialog).findByText(/valid 11-digit phone number/i),
    ).toBeInTheDocument();
    expect(purchaseDataBundle).not.toHaveBeenCalled();
  });

  it("disables confirmation when the balance is too low", async () => {
    const user = userEvent.setup();
    mockState.actor = createMockActor({
      listDataBundles: async () => [MTN_BUNDLE],
      getMyWallet: async () => ({
        balance: 100n,
        owner: null as never,
        createdAt: 0n,
      }),
    });

    renderWithProviders([{ path: "/", component: DataPage }]);

    await user.click(await screen.findByRole("button", { name: /^buy$/i }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: /confirm purchase/i }),
    ).toBeDisabled();
  });
});
