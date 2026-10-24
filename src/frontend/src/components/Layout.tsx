import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsAdmin, useWallet } from "@/hooks/useWallet";
import { formatNaira, shortPrincipal } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { LogOut, Menu, Wallet } from "lucide-react";
import { type ReactNode, useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

function BrandMark() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5"
      data-ocid="nav.brand_link"
      aria-label="Terminal Jade home"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
        <Wallet className="size-5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-tight">
          Terminal Jade
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Money Terminal
        </span>
      </span>
    </Link>
  );
}

function BalancePill() {
  const { data: wallet } = useWallet();
  return (
    <div
      className="hidden items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 sm:flex"
      data-ocid="header.balance"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Balance
      </span>
      <span className="font-mono font-tabular text-sm font-semibold text-credit">
        {wallet ? formatNaira(wallet.balance) : "—"}
      </span>
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: isAdmin = false } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const principal = identity?.getPrincipal().toText() ?? "";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <BrandMark />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AppNav isAdmin={isAdmin} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-muted-foreground">
              {principal ? principal.slice(0, 2).toUpperCase() : "··"}
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
              {principal ? shortPrincipal(principal) : "Not signed in"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => clear()}
              aria-label="Sign out"
              data-ocid="nav.sign_out_button"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 shadow-subtle md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
                data-ocid="nav.open_menu_button"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetHeader className="border-b border-sidebar-border px-5 py-4 text-left">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <BrandMark />
              </SheetHeader>
              <div className="px-3 py-4">
                <AppNav
                  isAdmin={isAdmin}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <BrandMark />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <BalancePill />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => clear()}
              aria-label="Sign out"
              data-ocid="header.sign_out_button"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main
          className={cn("flex-1 px-4 py-6 md:px-6 md:py-8")}
          data-ocid="page.content"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/40 px-4 py-4 md:px-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
            <span>
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                caffeine.ai
              </a>
            </span>
            <span className="font-mono">Terminal Jade · v1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
