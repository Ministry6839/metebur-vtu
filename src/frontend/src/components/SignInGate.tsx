import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2, ShieldCheck, Wallet } from "lucide-react";
import type { ReactNode } from "react";

interface SignInGateProps {
  children: ReactNode;
}

/**
 * Renders children only for authenticated users; otherwise shows a branded
 * sign-in screen. Uses `isAuthenticated` (not `isLoginSuccess`) so a restored
 * session on reload also unlocks the app.
 */
export function SignInGate({ children }: SignInGateProps) {
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();

  if (isInitializing) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        data-ocid="auth.loading_state"
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          <p className="text-sm">Restoring your session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-elevated animate-fade-in-up"
            data-ocid="auth.panel"
          >
            <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
              <Wallet className="size-6" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Terminal Jade
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Pay bills. Resell data.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              One wallet for electricity, airtime, cable TV, internet and mobile
              data bundles across MTN, Airtel, Glo and 9mobile.
            </p>
            <Button
              type="button"
              size="lg"
              className="mt-8 w-full rounded-lg"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="auth.sign_in_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Connecting…
                </>
              ) : (
                "Sign in with Internet Identity"
              )}
            </Button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Secured by Internet Identity
            </p>
          </div>
        </main>
        <footer className="border-t border-border bg-muted/40 px-6 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    );
  }

  return <>{children}</>;
}
