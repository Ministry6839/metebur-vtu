import type { backendInterface } from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";

/**
 * A mutable holder the per-file `vi.mock("@caffeineai/core-infrastructure")`
 * factory reads from. Tests set the actor and auth state before rendering.
 */
export const mockState: {
  actor: backendInterface | null;
  isFetching: boolean;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  principal: string;
} = {
  actor: null,
  isFetching: false,
  isAuthenticated: true,
  isInitializing: false,
  isLoggingIn: false,
  principal: "aaaaa-aa",
};

/** Reset the shared mock state between tests. */
export function resetMockState(): void {
  mockState.actor = null;
  mockState.isFetching = false;
  mockState.isAuthenticated = true;
  mockState.isInitializing = false;
  mockState.isLoggingIn = false;
  mockState.principal = "aaaaa-aa";
}

/**
 * The factory passed to `vi.mock("@caffeineai/core-infrastructure", ...)`.
 * Kept here so every test file mocks the same seam identically.
 */
export function coreInfrastructureMock() {
  return {
    useActor: () => ({
      actor: mockState.actor,
      isFetching: mockState.isFetching,
    }),
    useInternetIdentity: () => ({
      identity: {
        getPrincipal: () => ({ toText: () => mockState.principal }),
      },
      login: vi.fn(),
      clear: vi.fn(),
      loginStatus: mockState.isAuthenticated ? "success" : "idle",
      isInitializing: mockState.isInitializing,
      isLoginIdle: !mockState.isAuthenticated,
      isLoggingIn: mockState.isLoggingIn,
      isLoginSuccess: mockState.isAuthenticated,
      isLoginError: false,
      isSessionExpired: false,
      isAuthenticated: mockState.isAuthenticated,
    }),
  };
}

/**
 * A typed actor mock. Every method defaults to a benign empty result so a test
 * only has to override the methods its journey exercises.
 */
export function createMockActor(
  overrides: Partial<backendInterface> = {},
): backendInterface {
  const base: backendInterface = {
    _initialize_access_control: async () => undefined,
    _internet_identity_sign_in_finish: async () => ({
      __kind__: "ok",
      ok: null,
    }),
    _internet_identity_sign_in_start: async () => new Uint8Array(),
    assignCallerUserRole: async () => undefined,
    createBiller: async () => ({
      id: 0n,
      name: "",
      enabled: true,
      category: "electricity" as never,
    }),
    createDataBundle: async () => ({
      id: 0n,
      provider: "mtn" as never,
      name: "",
      validityDays: 0n,
      enabled: true,
      dataVolumeMb: 0n,
      price: 0n,
    }),
    execute: async () => ({ hasMore: false, rows: [] }),
    getApiDoc: async () => "",
    getCallerUserRole: async () => "user" as never,
    getMyLedger: async () => [],
    getMyWallet: async () => ({
      balance: 0n,
      owner: null as never,
      createdAt: 0n,
    }),
    getTransaction: async () => null,
    isCallerAdmin: async () => false,
    listAllBillPayments: async () => [],
    listAllDataOrders: async () => [],
    listBillers: async () => [],
    listDataBundles: async () => [],
    listMyBillPayments: async () => [],
    listMyDataOrders: async () => [],
    listTransactions: async () => [],
    payBill: async () => ({
      __kind__: "err",
      err: { __kind__: "notFound", notFound: null },
    }),
    purchaseDataBundle: async () => ({
      __kind__: "err",
      err: { __kind__: "notFound", notFound: null },
    }),
    schema: async () => "",
    topUpWallet: async () => ({
      at: 0n,
      id: 0n,
      owner: null as never,
      kind: "credit" as never,
      amount: 0n,
      reason: "",
    }),
    updateBiller: async () => ({
      __kind__: "err",
      err: "notFound" as never,
    }),
    updateDataBundle: async () => ({
      __kind__: "err",
      err: "notFound" as never,
    }),
  };
  return { ...base, ...overrides };
}

interface RouteSpec {
  path: string;
  component: () => ReactNode;
}

/**
 * Render a page inside the providers the app uses, with a memory router that
 * registers the given routes. `initialPath` selects which route renders.
 */
export function renderWithProviders(
  routes: RouteSpec[],
  initialPath = "/",
): RenderResult {
  const rootRoute = createRootRoute({
    component: () => (
      <div>
        <Outlet />
      </div>
    ),
  });

  const childRoutes = routes.map((route) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: route.path,
      component: route.component,
    }),
  );

  const router = createRouter({
    routeTree: rootRoute.addChildren(childRoutes),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
