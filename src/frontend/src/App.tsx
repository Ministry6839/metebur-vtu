import { Layout } from "@/components/Layout";
import { SignInGate } from "@/components/SignInGate";
import { Toaster } from "@/components/ui/sonner";
import { AdminPage } from "@/pages/Admin";
import { BillsPage } from "@/pages/Bills";
import { DashboardPage } from "@/pages/Dashboard";
import { DataPage } from "@/pages/Data";
import { TransactionDetailPage } from "@/pages/TransactionDetail";
import { TransactionsPage } from "@/pages/Transactions";
import { WalletPage } from "@/pages/Wallet";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <SignInGate>
      <Layout>
        <Outlet />
      </Layout>
    </SignInGate>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const dataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/data",
  component: DataPage,
});

const billsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bills",
  component: BillsPage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: WalletPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transactions",
  component: TransactionsPage,
});

const transactionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transactions/$id",
  component: TransactionDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  dataRoute,
  billsRoute,
  walletRoute,
  transactionsRoute,
  transactionDetailRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
