import { Amount, EmptyState, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useLedger, useTopUpWallet, useWallet } from "@/hooks/useWallet";
import { formatDateTime, formatNaira, nairaToKobo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Wallet as WalletIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const QUICK_AMOUNTS = [1000n, 2000n, 5000n, 10000n];

export function WalletPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: ledger = [], isLoading: ledgerLoading } = useLedger();
  const topUp = useTopUpWallet();

  const [amountInput, setAmountInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amount = nairaToKobo(amountInput);
  const sorted = [...ledger].sort((a, b) => Number(b.at - a.at));

  function handleTopUp() {
    if (amount <= 0n) {
      setError("Enter an amount greater than zero.");
      return;
    }
    const captured = amount;
    setAmountInput("");
    setError(null);
    topUp.mutate(captured, {
      onSuccess: () => {
        toast.success("Wallet topped up", {
          description: `${formatNaira(captured)} added to your balance.`,
        });
      },
      onError: () => {
        setError("Top-up failed. Please try again.");
        setAmountInput((current) =>
          current === "" ? (Number(captured) / 100).toFixed(2) : current,
        );
      },
    });
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        eyebrow="Wallet"
        title="Wallet & ledger"
        description="Top up your balance and review every credit and debit on your account."
      />

      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        <Card
          className="border-border bg-gradient-subtle shadow-elevated md:col-span-2"
          data-ocid="wallet.balance_card"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <WalletIcon className="size-4" aria-hidden="true" />
              Available balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {walletLoading ? (
              <Skeleton className="h-12 w-56" />
            ) : (
              <p className="font-mono font-tabular text-4xl font-bold tracking-tight md:text-5xl">
                {wallet ? formatNaira(wallet.balance) : "—"}
              </p>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              {wallet
                ? wallet.createdAt > 0n
                  ? `Opened ${formatDateTime(wallet.createdAt)}`
                  : "No activity yet"
                : "Loading wallet details…"}
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-border shadow-subtle"
          data-ocid="wallet.top_up_card"
        >
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Top up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="top-up-amount">Amount (₦)</Label>
              <Input
                id="top-up-amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amountInput}
                onChange={(event) => {
                  setAmountInput(event.target.value);
                  setError(null);
                }}
                aria-invalid={error !== null}
                data-ocid="wallet.amount_input"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value.toString()}
                  type="button"
                  onClick={() => {
                    setAmountInput((Number(value) / 100).toFixed(0));
                    setError(null);
                  }}
                  data-ocid={`wallet.quick_amount.${value}`}
                  className={cn(
                    "min-h-9 rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-xs font-medium transition-smooth",
                    "hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {formatNaira(value)}
                </button>
              ))}
            </div>
            {error && (
              <p
                className="text-sm text-debit"
                role="alert"
                data-ocid="wallet.error_state"
              >
                {error}
              </p>
            )}
            <Button
              type="button"
              className="w-full rounded-lg"
              onClick={handleTopUp}
              disabled={topUp.isPending || amount <= 0n}
              data-ocid="wallet.top_up_button"
            >
              {topUp.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Adding funds…
                </>
              ) : (
                <>
                  <Plus className="size-4" aria-hidden="true" />
                  Add funds
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Ledger</h2>
        {ledgerLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => `ledger-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-16 w-full rounded-xl" />
              ),
            )}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            ocid="wallet.empty_state"
            icon={<WalletIcon className="size-6" aria-hidden="true" />}
            title="Your ledger is empty"
            description="Top up your wallet to create your first credit entry."
          />
        ) : (
          <Card className="overflow-hidden border-border p-0 shadow-subtle">
            <ul className="divide-y divide-border">
              {sorted.map((entry) => {
                const credit = entry.kind === "credit";
                return (
                  <li
                    key={entry.id.toString()}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5",
                      credit ? "ledger-rail-credit" : "ledger-rail-debit",
                    )}
                    data-ocid="wallet.ledger_item"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {credit ? "Credit" : "Debit"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {entry.reason}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Amount
                        amount={entry.amount}
                        direction={credit ? "credit" : "debit"}
                      />
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(entry.at)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
