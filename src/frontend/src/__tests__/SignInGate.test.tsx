import { SignInGate } from "@/components/SignInGate";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockState, resetMockState } from "./test-utils";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfrastructureMock } = await import("./test-utils");
  return coreInfrastructureMock();
});

describe("SignInGate", () => {
  beforeEach(() => {
    resetMockState();
  });

  it("shows the sign-in screen when the user is not authenticated", () => {
    mockState.isAuthenticated = false;
    render(
      <SignInGate>
        <p>Secret dashboard</p>
      </SignInGate>,
    );

    expect(
      screen.getByRole("button", { name: /sign in with internet identity/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });

  it("renders children once the user is authenticated", () => {
    mockState.isAuthenticated = true;
    render(
      <SignInGate>
        <p>Secret dashboard</p>
      </SignInGate>,
    );

    expect(screen.getByText("Secret dashboard")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /sign in with internet identity/i }),
    ).not.toBeInTheDocument();
  });

  it("shows a restoring state while the session initializes", () => {
    mockState.isInitializing = true;
    render(
      <SignInGate>
        <p>Secret dashboard</p>
      </SignInGate>,
    );

    expect(screen.getByText(/restoring your session/i)).toBeInTheDocument();
    expect(screen.queryByText("Secret dashboard")).not.toBeInTheDocument();
  });
});
