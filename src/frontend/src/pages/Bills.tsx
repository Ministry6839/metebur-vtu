import { EmptyState, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillers, usePayBill } from "@/hooks/useTransactions";
import { useWallet } from "@/hooks/useWallet";
import { formatNaira, nairaToKobo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BillCategory, type BillerView, CATEGORY_LABELS } from "@/types";
import {
  CheckCircle2,
  Loader2,
  Plug,
  ReceiptText,
  Signal,
  TriangleAlert,
  Tv,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const CATEGORIES: { value: BillCategory; label: string; icon: LucideIcon }[] = [
  { value: BillCategory.electricity, label: "Electricity", icon: Plug },
  { value: BillCategory.airtime, label: "Airtime", icon: Signal },
  { value: BillCategory.cableTv, label: "Cable TV", icon: Tv },
  { value: BillCategory.internet, label: "Internet", icon: Wifi },
];

export function BillsPage() {
  const { data: billers = [], isLoading } = useBillers();
  const { data: wallet } = useWallet();
  const payBill = usePayBill();

  const [category, setCategory] = useState<BillCategory>(
    BillCategory.electricity,
  );
  const [selected, setSelected] = useState<BillerView | null>(null);
  const [customerNumber, setCustomerNumber] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      billers.filter(
        (biller) => biller.category === category && biller.enabled,
      ),
    [billers, category],
  );

  const balance = wallet?.balance ?? 0n;
  const amount = nairaToKobo(amountInput);
  const insufficient = amount > 0n && balance < amount;

  function openBiller(biller: BillerView) {
    setSelected(biller);
    setCustomerNumber("");
    setAmountInput("");
    setError(null);
  }

  function closeDialog() {
    setSelected(null);
    setError(null);
  }

  function handleConfirm() {
    if (!selected) return;
    if (customerNumber.trim().length < 4) {
      setError("Enter a valid customer or meter number.");
      return;
    }
    if (amount <= 0n) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (insufficient) {
      setError("Your wallet balance is too low. Top up first.");
      return;
    }
    const biller = selected;
    payBill.mutate(
      { billerId: biller.id, customerNumber: customerNumber.trim(), amount },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            toast.success("Bill paid", {
              description: `${formatNaira(amount)} paid to ${biller.name}.`,
            });
            closeDialog();
          } else {
            setError(
              result.err.__kind__ === "insufficientFunds"
                ? "Insufficient wallet balance."
                : "Could not complete this payment. Please try again.",
            );
          }
        },
        onError: () => setError("Something went wrong. Please try again."),
      },
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        eyebrow="Bill payment"
        title="Pay a bill"
        description="Choose a category and biller, then pay from your wallet balance."
      />

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        role="tablist"
        aria-label="Bill category"
      >
        {CATEGORIES.map((item) => {
          const Icon = item.icon;
          const active = category === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(item.value)}
              data-ocid={`bills.category.${item.value}`}
              className={cn(
                "flex min-h-20 flex-col items-start gap-2 rounded-xl border p-4 text-left transition-smooth",
                active
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              <Icon
                className={cn(
                  "size-5",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => `biller-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-28 w-full rounded-xl" />
            ),
          )}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          ocid="bills.empty_state"
          icon={<ReceiptText className="size-6" aria-hidden="true" />}
          title={`No ${CATEGORY_LABELS[category]} billers`}
          description="No billers are available in this category right now. Try another category."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {filtered.map((biller) => (
            <Card
              key={biller.id.toString()}
              className="border-border shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
              data-ocid="bills.biller_card"
            >
              <CardContent className="flex h-full flex-col gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ReceiptText className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold">
                    {biller.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[biller.category]}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-auto rounded-lg"
                  onClick={() => openBiller(biller)}
                  data-ocid="bills.pay_button"
                >
                  Pay bill
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md" data-ocid="bills.confirm_modal">
          <DialogHeader>
            <DialogTitle>Confirm bill payment</DialogTitle>
            <DialogDescription>
              Enter the customer number and amount, then confirm to pay from
              your wallet.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Biller</dt>
                    <dd className="font-medium">{selected.name}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">
                      {CATEGORY_LABELS[selected.category]}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-number">Customer / meter number</Label>
                <Input
                  id="customer-number"
                  value={customerNumber}
                  onChange={(event) => {
                    setCustomerNumber(event.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. 04512345678"
                  aria-invalid={error !== null}
                  data-ocid="bills.customer_input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill-amount">Amount (₦)</Label>
                <Input
                  id="bill-amount"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(event) => {
                    setAmountInput(event.target.value);
                    setError(null);
                  }}
                  placeholder="0.00"
                  aria-invalid={error !== null}
                  data-ocid="bills.amount_input"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">Wallet balance</span>
                <span className="font-mono font-tabular font-semibold">
                  {formatNaira(balance)}
                </span>
              </div>

              {error && (
                <p
                  className="flex items-start gap-2 text-sm text-debit"
                  role="alert"
                  data-ocid="bills.error_state"
                >
                  <TriangleAlert
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {error}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={closeDialog}
              data-ocid="bills.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={handleConfirm}
              disabled={payBill.isPending || insufficient}
              data-ocid="bills.confirm_button"
            >
              {payBill.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Confirm payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
