import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/data", label: "Buy Data", icon: Smartphone },
  { to: "/bills", label: "Pay Bills", icon: ReceiptText },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: ArrowDownToLine },
  { to: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

interface AppNavProps {
  isAdmin: boolean;
  onNavigate?: () => void;
}

export function AppNav({ isAdmin, onNavigate }: AppNavProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav
      aria-label="Primary"
      className="flex flex-col gap-1"
      data-ocid="nav.list"
    >
      {items.map((item) => {
        const active =
          item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-primary"
              />
            )}
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
