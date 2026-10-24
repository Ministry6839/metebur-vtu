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
import { useDataBundles, usePurchaseDataBundle } from "@/hooks/useTransactions";
import { useWallet } from "@/hooks/useWallet";
import {
  formatDataVolume,
  formatNaira,
  formatValidity,
  isValidPhone,
  normalizePhone,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { type DataBundleView, NETWORK_LABELS, NetworkProvider } from "@/types";
import { CheckCircle2, Loader2, Smartphone, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PROVIDERS: { value: NetworkProvider; label: string }[] = [
  { value: NetworkProvider.mtn, label: "MTN" },
  { value: NetworkProvider.airtel, label: "Airtel" },
  { value: NetworkProvider.glo, label: "Glo" },
  { value: NetworkProvider.nineMobile, label: "9mobile" },
];

export function DataPage() {
  const { data: bundles = [], isLoading } = useDataBundles();
  const { data: wallet } = useWallet();
  const purchase = usePurchaseDataBundle();

  const [provider, setProvider] = useState<NetworkProvider>(
    NetworkProvider.mtn,
  );
  const [selected, setSelected] = useState<DataBundleView | null>(null);
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      bundles.filter(
        (bundle) => bundle.provider === provider && bundle.enabled,
      ),
    [bundles, provider],
  );

  const balance = wallet?.balance ?? 0n;
  const insufficient = selected ? balance < selected.price : false;

  function openBundle(bundle: DataBundleView) {
    setSelected(bundle);
    setRecipient("");
    setError(null);
  }

  function closeDialog() {
    setSelected(null);
    setError(null);
  }

  function handleConfirm() {
    if (!selected) return;
    const phone = normalizePhone(recipient);
    if (!isValidPhone(phone)) {
      setError("Enter a valid 11-digit phone number, e.g. 08031234567.");
      return;
    }
    if (insufficient) {
      setError("Your wallet balance is too low for this bundle. Top up first.");
      return;
    }
    const bundle = selected;
    purchase.mutate(
      { bundleId: bundle.id, recipient: phone },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            toast.success("Data bundle purchased", {
              description: `${bundle.name} sent to ${phone}.`,
            });
            closeDialog();
          } else {
            setError(
              result.err.__kind__ === "insufficientFunds"
                ? "Insufficient wallet balance."
                : "Could not complete this purchase. Please try again.",
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
        eyebrow="Data reselling"
        title="Buy mobile data"
        description="Pick a network, choose a bundle, and send it to any phone number from your wallet."
      />

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Network provider"
        data-ocid="data.provider.tab"
      >
        {PROVIDERS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={provider === item.value}
            onClick={() => setProvider(item.value)}
            data-ocid={`data.provider.${item.value}`}
            className={cn(
              "min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition-smooth",
              provider === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => `bundle-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-40 w-full rounded-xl" />
            ),
          )}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          ocid="data.empty_state"
          icon={<Smartphone className="size-6" aria-hidden="true" />}
          title={`No ${NETWORK_LABELS[provider]} bundles available`}
          description="Bundles for this network are not on sale right now. Try another network."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {filtered.map((bundle) => (
            <Card
              key={bundle.id.toString()}
              className="group border-border shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
              data-ocid="data.bundle_card"
            >
              <CardContent className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {NETWORK_LABELS[bundle.provider]}
                    </p>
                    <h3 className="mt-1 truncate font-display text-lg font-semibold">
                      {bundle.name}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-credit-muted px-2.5 py-1 font-mono text-xs font-semibold text-credit">
                    {formatDataVolume(bundle.dataVolumeMb)}
                  </span>
                </div>
                <dl className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">Validity</dt>
                  <dd className="font-medium">
                    {formatValidity(bundle.validityDays)}
                  </dd>
                </dl>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="font-mono font-tabular text-lg font-bold">
                    {formatNaira(bundle.price)}
                  </span>
                  <Button
                    type="button"
                    className="rounded-lg"
                    onClick={() => openBundle(bundle)}
                    data-ocid="data.buy_button"
                  >
                    Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md" data-ocid="data.confirm_modal">
          <DialogHeader>
            <DialogTitle>Confirm data purchase</DialogTitle>
            <DialogDescription>
              Review the bundle and enter the recipient number before
              confirming.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Network</dt>
                    <dd className="font-medium">
                      {NETWORK_LABELS[selected.provider]}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Bundle</dt>
                    <dd className="font-medium">{selected.name}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Data</dt>
                    <dd className="font-medium">
                      {formatDataVolume(selected.dataVolumeMb)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <dt className="text-muted-foreground">Price</dt>
                    <dd className="font-mono font-tabular font-semibold text-debit">
                      {formatNaira(selected.price)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-phone">Recipient phone number</Label>
                <Input
                  id="recipient-phone"
                  inputMode="tel"
                  placeholder="08031234567"
                  value={recipient}
                  onChange={(event) => {
                    setRecipient(event.target.value);
                    setError(null);
                  }}
                  aria-invalid={error !== null}
                  data-ocid="data.recipient_input"
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
                  data-ocid="data.error_state"
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
              data-ocid="data.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={handleConfirm}
              disabled={purchase.isPending || insufficient}
              data-ocid="data.confirm_button"
            >
              {purchase.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Confirm purchase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
