import { createActor } from "@/backend";
import {
  Amount,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAllBillPayments,
  useAllDataOrders,
  useBillers,
  useDataBundles,
} from "@/hooks/useTransactions";
import { useIsAdmin } from "@/hooks/useWallet";
import {
  formatDataVolume,
  formatDateTime,
  formatNaira,
  formatValidity,
  nairaToKobo,
} from "@/lib/format";
import {
  BillCategory,
  type BillerView,
  CATEGORY_LABELS,
  type DataBundleView,
  NETWORK_LABELS,
  NetworkProvider,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PROVIDERS = [
  NetworkProvider.mtn,
  NetworkProvider.airtel,
  NetworkProvider.glo,
  NetworkProvider.nineMobile,
];

const CATEGORIES = [
  BillCategory.electricity,
  BillCategory.airtime,
  BillCategory.cableTv,
  BillCategory.internet,
];

interface BundleForm {
  id: bigint | null;
  provider: NetworkProvider;
  name: string;
  dataVolumeMb: string;
  validityDays: string;
  price: string;
  enabled: boolean;
}

interface BillerForm {
  id: bigint | null;
  category: BillCategory;
  name: string;
  enabled: boolean;
}

const EMPTY_BUNDLE: BundleForm = {
  id: null,
  provider: NetworkProvider.mtn,
  name: "",
  dataVolumeMb: "",
  validityDays: "30",
  price: "",
  enabled: true,
};

const EMPTY_BILLER: BillerForm = {
  id: null,
  category: BillCategory.electricity,
  name: "",
  enabled: true,
};

export function AdminPage() {
  const { data: isAdmin = false, isLoading: adminLoading } = useIsAdmin();
  const { data: bundles = [], isLoading: bundlesLoading } = useDataBundles();
  const { data: billers = [], isLoading: billersLoading } = useBillers();
  const { data: orders = [], isLoading: ordersLoading } =
    useAllDataOrders(isAdmin);
  const { data: payments = [], isLoading: paymentsLoading } =
    useAllBillPayments(isAdmin);

  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  const [bundleForm, setBundleForm] = useState<BundleForm | null>(null);
  const [billerForm, setBillerForm] = useState<BillerForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const saveBundle = useMutation({
    mutationFn: async (form: BundleForm) => {
      if (!actor) throw new Error("Backend is not ready");
      const volume = BigInt(
        Math.max(1, Math.round(Number(form.dataVolumeMb) || 0)),
      );
      const validity = BigInt(
        Math.max(1, Math.round(Number(form.validityDays) || 0)),
      );
      const price = nairaToKobo(form.price);
      if (form.id === null) {
        return actor.createDataBundle(
          form.provider,
          form.name.trim(),
          volume,
          validity,
          price,
        );
      }
      return actor.updateDataBundle(
        form.id,
        form.provider,
        form.name.trim(),
        volume,
        validity,
        price,
        form.enabled,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dataBundles"] });
      toast.success("Bundle saved");
      setBundleForm(null);
    },
    onError: () =>
      setFormError(
        "Could not save the bundle. Check the values and try again.",
      ),
  });

  const saveBiller = useMutation({
    mutationFn: async (form: BillerForm) => {
      if (!actor) throw new Error("Backend is not ready");
      if (form.id === null) {
        return actor.createBiller(form.category, form.name.trim());
      }
      return actor.updateBiller(
        form.id,
        form.category,
        form.name.trim(),
        form.enabled,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["billers"] });
      toast.success("Biller saved");
      setBillerForm(null);
    },
    onError: () =>
      setFormError(
        "Could not save the biller. Check the values and try again.",
      ),
  });

  if (adminLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  if (!isAdmin) {
    return (
      <div className="animate-fade-in-up">
        <Card
          className="mx-auto max-w-lg border-border shadow-subtle"
          data-ocid="admin.denied_state"
        >
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-debit-muted text-debit">
              <ShieldAlert className="size-6" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-semibold">
              Admin access required
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              This console is restricted to administrators. Your account does
              not have permission to manage bundles, billers, or view all
              orders.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function submitBundle() {
    if (!bundleForm) return;
    if (!bundleForm.name.trim()) {
      setFormError("Enter a bundle name.");
      return;
    }
    if (nairaToKobo(bundleForm.price) <= 0n) {
      setFormError("Enter a price greater than zero.");
      return;
    }
    setFormError(null);
    saveBundle.mutate(bundleForm);
  }

  function submitBiller() {
    if (!billerForm) return;
    if (!billerForm.name.trim()) {
      setFormError("Enter a biller name.");
      return;
    }
    setFormError(null);
    saveBiller.mutate(billerForm);
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        eyebrow="Admin console"
        title="Catalog & orders"
        description="Manage data bundles and billers, and review every order and payment across users."
      />

      <Tabs defaultValue="bundles" className="space-y-6">
        <TabsList data-ocid="admin.tabs">
          <TabsTrigger value="bundles" data-ocid="admin.bundles.tab">
            Data bundles
          </TabsTrigger>
          <TabsTrigger value="billers" data-ocid="admin.billers.tab">
            Billers
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.orders.tab">
            Orders & payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bundles" className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              className="rounded-lg"
              onClick={() => {
                setFormError(null);
                setBundleForm({ ...EMPTY_BUNDLE });
              }}
              data-ocid="admin.create_bundle_button"
            >
              <Plus className="size-4" aria-hidden="true" />
              New bundle
            </Button>
          </div>
          {bundlesLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : bundles.length === 0 ? (
            <EmptyState
              ocid="admin.bundles.empty_state"
              icon={<ShieldCheck className="size-6" aria-hidden="true" />}
              title="No data bundles yet"
              description="Create your first bundle so users can buy data."
            />
          ) : (
            <Card className="overflow-hidden border-border p-0 shadow-subtle">
              <ul className="divide-y divide-border">
                {bundles.map((bundle) => (
                  <li
                    key={bundle.id.toString()}
                    className="flex items-center gap-4 px-4 py-3.5"
                    data-ocid="admin.bundle_item"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {NETWORK_LABELS[bundle.provider]} · {bundle.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDataVolume(bundle.dataVolumeMb)} ·{" "}
                        {formatValidity(bundle.validityDays)}
                      </p>
                    </div>
                    <span className="font-mono font-tabular text-sm font-semibold">
                      {formatNaira(bundle.price)}
                    </span>
                    <StatusBadge
                      status={bundle.enabled ? "enabled" : "disabled"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${bundle.name}`}
                      onClick={() => {
                        setFormError(null);
                        setBundleForm({
                          id: bundle.id,
                          provider: bundle.provider,
                          name: bundle.name,
                          dataVolumeMb: bundle.dataVolumeMb.toString(),
                          validityDays: bundle.validityDays.toString(),
                          price: (Number(bundle.price) / 100).toFixed(2),
                          enabled: bundle.enabled,
                        });
                      }}
                      data-ocid="admin.edit_bundle_button"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="billers" className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              className="rounded-lg"
              onClick={() => {
                setFormError(null);
                setBillerForm({ ...EMPTY_BILLER });
              }}
              data-ocid="admin.create_biller_button"
            >
              <Plus className="size-4" aria-hidden="true" />
              New biller
            </Button>
          </div>
          {billersLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : billers.length === 0 ? (
            <EmptyState
              ocid="admin.billers.empty_state"
              icon={<ShieldCheck className="size-6" aria-hidden="true" />}
              title="No billers yet"
              description="Create your first biller so users can pay bills."
            />
          ) : (
            <Card className="overflow-hidden border-border p-0 shadow-subtle">
              <ul className="divide-y divide-border">
                {billers.map((biller) => (
                  <li
                    key={biller.id.toString()}
                    className="flex items-center gap-4 px-4 py-3.5"
                    data-ocid="admin.biller_item"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {biller.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {CATEGORY_LABELS[biller.category]}
                      </p>
                    </div>
                    <StatusBadge
                      status={biller.enabled ? "enabled" : "disabled"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${biller.name}`}
                      onClick={() => {
                        setFormError(null);
                        setBillerForm({
                          id: biller.id,
                          category: biller.category,
                          name: biller.name,
                          enabled: biller.enabled,
                        });
                      }}
                      data-ocid="admin.edit_biller_button"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Data orders
            </h2>
            {ordersLoading ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : orders.length === 0 ? (
              <EmptyState
                ocid="admin.orders.empty_state"
                icon={<ShieldCheck className="size-6" aria-hidden="true" />}
                title="No data orders yet"
                description="Data purchases across all users will appear here."
              />
            ) : (
              <Card className="overflow-hidden border-border p-0 shadow-subtle">
                <ul className="divide-y divide-border">
                  {orders.map((order) => (
                    <li
                      key={order.id.toString()}
                      className="flex items-center gap-4 px-4 py-3.5 ledger-rail-debit"
                      data-ocid="admin.order_item"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {order.provider} · {order.bundleName}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {order.recipient} · {order.reference}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                      <div className="flex flex-col items-end gap-1">
                        <Amount amount={order.amount} direction="debit" />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(order.at)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Bill payments
            </h2>
            {paymentsLoading ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : payments.length === 0 ? (
              <EmptyState
                ocid="admin.payments.empty_state"
                icon={<ShieldCheck className="size-6" aria-hidden="true" />}
                title="No bill payments yet"
                description="Bill payments across all users will appear here."
              />
            ) : (
              <Card className="overflow-hidden border-border p-0 shadow-subtle">
                <ul className="divide-y divide-border">
                  {payments.map((payment) => (
                    <li
                      key={payment.id.toString()}
                      className="flex items-center gap-4 px-4 py-3.5 ledger-rail-debit"
                      data-ocid="admin.payment_item"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {payment.billerName}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {payment.customerNumber} · {payment.reference}
                        </p>
                      </div>
                      <StatusBadge status={payment.status} />
                      <div className="flex flex-col items-end gap-1">
                        <Amount amount={payment.amount} direction="debit" />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(payment.at)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>
        </TabsContent>
      </Tabs>

      {/* Bundle editor */}
      <Dialog
        open={bundleForm !== null}
        onOpenChange={(open) => !open && setBundleForm(null)}
      >
        <DialogContent className="sm:max-w-md" data-ocid="admin.bundle_modal">
          <DialogHeader>
            <DialogTitle>
              {bundleForm?.id === null ? "New data bundle" : "Edit data bundle"}
            </DialogTitle>
            <DialogDescription>
              Set the network, volume, validity, and price for this bundle.
            </DialogDescription>
          </DialogHeader>
          {bundleForm && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bundle-provider">Network</Label>
                <Select
                  value={bundleForm.provider}
                  onValueChange={(value) =>
                    setBundleForm({
                      ...bundleForm,
                      provider: value as NetworkProvider,
                    })
                  }
                >
                  <SelectTrigger
                    id="bundle-provider"
                    data-ocid="admin.bundle_provider_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {NETWORK_LABELS[provider]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bundle-name">Bundle name</Label>
                <Input
                  id="bundle-name"
                  value={bundleForm.name}
                  onChange={(event) =>
                    setBundleForm({ ...bundleForm, name: event.target.value })
                  }
                  placeholder="e.g. 1GB Monthly"
                  data-ocid="admin.bundle_name_input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bundle-volume">Volume (MB)</Label>
                  <Input
                    id="bundle-volume"
                    inputMode="numeric"
                    value={bundleForm.dataVolumeMb}
                    onChange={(event) =>
                      setBundleForm({
                        ...bundleForm,
                        dataVolumeMb: event.target.value,
                      })
                    }
                    placeholder="1024"
                    data-ocid="admin.bundle_volume_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundle-validity">Validity (days)</Label>
                  <Input
                    id="bundle-validity"
                    inputMode="numeric"
                    value={bundleForm.validityDays}
                    onChange={(event) =>
                      setBundleForm({
                        ...bundleForm,
                        validityDays: event.target.value,
                      })
                    }
                    placeholder="30"
                    data-ocid="admin.bundle_validity_input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bundle-price">Price (₦)</Label>
                <Input
                  id="bundle-price"
                  inputMode="decimal"
                  value={bundleForm.price}
                  onChange={(event) =>
                    setBundleForm({ ...bundleForm, price: event.target.value })
                  }
                  placeholder="0.00"
                  data-ocid="admin.bundle_price_input"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <Label htmlFor="bundle-enabled" className="cursor-pointer">
                  Enabled for purchase
                </Label>
                <Switch
                  id="bundle-enabled"
                  checked={bundleForm.enabled}
                  onCheckedChange={(checked) =>
                    setBundleForm({ ...bundleForm, enabled: checked })
                  }
                  data-ocid="admin.bundle_enabled_switch"
                />
              </div>
              {formError && (
                <p
                  className="text-sm text-debit"
                  role="alert"
                  data-ocid="admin.bundle_error_state"
                >
                  {formError}
                </p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setBundleForm(null)}
              data-ocid="admin.bundle_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={submitBundle}
              disabled={saveBundle.isPending}
              data-ocid="admin.bundle_save_button"
            >
              {saveBundle.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save bundle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Biller editor */}
      <Dialog
        open={billerForm !== null}
        onOpenChange={(open) => !open && setBillerForm(null)}
      >
        <DialogContent className="sm:max-w-md" data-ocid="admin.biller_modal">
          <DialogHeader>
            <DialogTitle>
              {billerForm?.id === null ? "New biller" : "Edit biller"}
            </DialogTitle>
            <DialogDescription>
              Set the category and name for this biller.
            </DialogDescription>
          </DialogHeader>
          {billerForm && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="biller-category">Category</Label>
                <Select
                  value={billerForm.category}
                  onValueChange={(value) =>
                    setBillerForm({
                      ...billerForm,
                      category: value as BillCategory,
                    })
                  }
                >
                  <SelectTrigger
                    id="biller-category"
                    data-ocid="admin.biller_category_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="biller-name">Biller name</Label>
                <Input
                  id="biller-name"
                  value={billerForm.name}
                  onChange={(event) =>
                    setBillerForm({ ...billerForm, name: event.target.value })
                  }
                  placeholder="e.g. Ikeja Electric"
                  data-ocid="admin.biller_name_input"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <Label htmlFor="biller-enabled" className="cursor-pointer">
                  Enabled for payment
                </Label>
                <Switch
                  id="biller-enabled"
                  checked={billerForm.enabled}
                  onCheckedChange={(checked) =>
                    setBillerForm({ ...billerForm, enabled: checked })
                  }
                  data-ocid="admin.biller_enabled_switch"
                />
              </div>
              {formError && (
                <p
                  className="text-sm text-debit"
                  role="alert"
                  data-ocid="admin.biller_error_state"
                >
                  {formError}
                </p>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => setBillerForm(null)}
              data-ocid="admin.biller_cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={submitBiller}
              disabled={saveBiller.isPending}
              data-ocid="admin.biller_save_button"
            >
              {saveBiller.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save biller"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
