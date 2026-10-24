import { AppNav } from "@/components/AppNav";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function renderNav(isAdmin: boolean) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <AppNav isAdmin={isAdmin} />,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return render(<RouterProvider router={router} />);
}

describe("AppNav", () => {
  it("hides the admin link from a non-admin", async () => {
    renderNav(false);

    expect(
      await screen.findByRole("link", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Admin" }),
    ).not.toBeInTheDocument();
  });

  it("shows the admin link to an admin", async () => {
    renderNav(true);

    expect(
      await screen.findByRole("link", { name: "Admin" }),
    ).toBeInTheDocument();
  });
});
