import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface AmountProps {
  amount: bigint;
  direction: "credit" | "debit";
  className?: string;
}

/** Signed, tabular-mono amount with a direction icon — money direction is never color-only. */
export function Amount({ amount, direction, className }: AmountProps) {
  const credit = direction === "credit";
  const Icon = credit ? ArrowDownLeft : ArrowUpRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-tabular text-sm font-semibold",
        credit ? "text-credit" : "text-debit",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {credit ? "+" : "−"}
      {formatNaira(amount)}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
}

/** Status pill: completed/credit = jade, failed/debit = coral, pending = neutral. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const tone =
    normalized === "completed" || normalized === "success"
      ? "bg-credit-muted text-credit"
      : normalized === "failed" || normalized === "error"
        ? "bg-debit-muted text-debit"
        : "bg-muted text-muted-foreground";
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-transparent px-2.5 py-0.5 text-xs font-medium capitalize",
        tone,
      )}
    >
      {status}
    </Badge>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  ocid?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  ocid,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center"
      data-ocid={ocid ?? "empty_state"}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
