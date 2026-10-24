import { Amount, PageHeader, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransaction } from "@/hooks/useTransactions";
import { formatDateTime } from "@/lib/format";
import { TransactionType } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, ReceiptText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  topUp: "Wallet top-up",
  dataPurchase: "Data purchase",
  billPayment: "Bill payment",
};

export function TransactionDetailPage() {
  const { id } = useParams({ from: "/transactions/$id" });
  const txId = /^\d+$/.test(id) ? BigInt(id) : null;
  const { data: tx, isLoading } = useTransaction(txId);
  const [copied, setCopied] = useState(false);

  const credit = tx?.kind === TransactionType.topUp;

  async function copyReference(reference: string) {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      toast.success("Reference copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the reference");
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 rounded-lg"
          data-ocid="transaction.back_button"
        >
          <Link to="/transactions">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to transactions
          </Link>
        </Button>
      </div>

      <PageHeader eyebrow="Receipt" title="Transaction detail" />

      {isLoading ? (
        <Skeleton className="h-80 w-full max-w-xl rounded-xl" />
      ) : !tx ? (
        <Card
          className="max-w-xl border-border shadow-subtle"
          data-ocid="transaction.not_found"
        >
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ReceiptText
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="font-display text-lg font-semibold">
              Transaction not found
            </h3>
            <p className="text-sm text-muted-foreground">
              This transaction may have been removed or does not belong to your
              account.
            </p>
            <Button asChild variant="outline" className="mt-2 rounded-lg">
              <Link to="/transactions">Back to transactions</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="max-w-xl overflow-hidden border-border shadow-elevated"
          data-ocid="transaction.receipt"
        >
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {TYPE_LABELS[tx.kind] ?? tx.kind}
              </CardTitle>
              <StatusBadge status={tx.status} />
            </div>
            <div className="pt-3">
              <Amount
                amount={tx.amount}
                direction={credit ? "credit" : "debit"}
                className="text-3xl"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="divide-y divide-border">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Counterparty</dt>
                <dd className="min-w-0 truncate text-sm font-medium">
                  {tx.counterparty}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Reference</dt>
                <dd className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-sm">
                    {tx.reference}
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyReference(tx.reference)}
                    aria-label="Copy reference"
                    data-ocid="transaction.copy_button"
                    className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-smooth hover:border-primary/50 hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Copy className="size-3.5" aria-hidden="true" />
                    )}
                  </button>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Type</dt>
                <dd className="text-sm font-medium">
                  {TYPE_LABELS[tx.kind] ?? tx.kind}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Date</dt>
                <dd className="text-sm font-medium">{formatDateTime(tx.at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">
                  Transaction ID
                </dt>
                <dd className="font-mono text-sm">#{tx.id.toString()}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/transactions">View all transactions</Link>
              </Button>
              <Button asChild className="rounded-lg">
                <Link to="/wallet">Go to wallet</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
