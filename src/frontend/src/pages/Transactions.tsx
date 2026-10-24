import {
  Amount,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/useTransactions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type TransactionFilter, TransactionType } from "@/types";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ReceiptText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

const TYPE_LABELS: Record<string, string> = {
  topUp: "Top-up",
  dataPurchase: "Data",
  billPayment: "Bill",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: TransactionType.topUp, label: "Top-ups" },
  { value: TransactionType.dataPurchase, label: "Data" },
  { value: TransactionType.billPayment, label: "Bills" },
];

export function TransactionsPage() {
  const [kind, setKind] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filter = useMemo<TransactionFilter>(() => {
    const next: TransactionFilter = {};
    if (kind !== "all") next.kind = kind as TransactionType;
    if (search.trim()) next.search = search.trim();
    if (from) next.from = BigInt(new Date(from).getTime()) * 1_000_000n;
    if (to) next.to = BigInt(new Date(`${to}T23:59:59`).getTime()) * 1_000_000n;
    return next;
  }, [kind, search, from, to]);

  const { data: transactions = [], isLoading } = useTransactions(filter);

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => Number(b.at - a.at)),
    [transactions],
  );

  const hasFilters =
    kind !== "all" || search.trim() !== "" || from !== "" || to !== "";

  function clearFilters() {
    setKind("all");
    setSearch("");
    setFrom("");
    setTo("");
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        eyebrow="History"
        title="Transactions"
        description="Every top-up, data purchase, and bill payment in one ledger."
      />

      <Card
        className="border-border p-4 shadow-subtle md:p-5"
        data-ocid="transactions.filters"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tx-search">Search</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="tx-search"
                className="pl-9"
                placeholder="Phone number or reference"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                data-ocid="transactions.search_input"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-from">From</Label>
            <Input
              id="tx-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              data-ocid="transactions.from_input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-to">To</Label>
            <Input
              id="tx-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              data-ocid="transactions.to_input"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Transaction type"
          >
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={kind === item.value}
                onClick={() => setKind(item.value)}
                data-ocid={`transactions.filter.${item.value}`}
                className={cn(
                  "min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-smooth",
                  kind === item.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto rounded-lg"
              onClick={clearFilters}
              data-ocid="transactions.clear_button"
            >
              <X className="size-4" aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => `tx-skeleton-${i}`).map((id) => (
            <Skeleton key={id} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          ocid="transactions.empty_state"
          icon={<ReceiptText className="size-6" aria-hidden="true" />}
          title="No transactions found"
          description={
            hasFilters
              ? "No transactions match your filters. Try widening the date range or clearing the search."
              : "Your top-ups, data purchases, and bill payments will appear here."
          }
          action={
            hasFilters ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={clearFilters}
                data-ocid="transactions.empty_clear_button"
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Ledger
            </h2>
            <p
              className="font-mono text-xs text-muted-foreground"
              data-ocid="transactions.result_count"
            >
              {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <Card className="overflow-hidden border-border p-0 shadow-subtle">
            <ul className="divide-y divide-border">
              {sorted.map((tx, index) => {
                const credit = tx.kind === TransactionType.topUp;
                return (
                  <li key={tx.id.toString()}>
                    <Link
                      to="/transactions/$id"
                      params={{ id: tx.id.toString() }}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 transition-smooth hover:bg-muted/40",
                        credit ? "ledger-rail-credit" : "ledger-rail-debit",
                      )}
                      data-ocid={`transactions.item.${index + 1}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {tx.counterparty}
                          </p>
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {TYPE_LABELS[tx.kind] ?? tx.kind}
                          </span>
                        </div>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {tx.reference}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <StatusBadge status={tx.status} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Amount
                          amount={tx.amount}
                          direction={credit ? "credit" : "debit"}
                        />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(tx.at)}
                        </span>
                      </div>
                      <ChevronRight
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}
