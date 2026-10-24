import {
  Amount,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBillPayments, useMyDataOrders } from "@/hooks/useTransactions";
import { useLedger, useWallet } from "@/hooks/useWallet";
import { formatNaira, formatRelative } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Plus,
  ReceiptText,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount: bigint;
  direction: "credit" | "debit";
  status: string;
  at: bigint;
}

export function DashboardPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: ledger = [], isLoading: ledgerLoading } = useLedger();
  const { data: orders = [] } = useMyDataOrders();
  const { data: payments = [] } = useMyBillPayments();

  const activity: ActivityItem[] = [
    ...ledger.map((entry) => ({
      id: `ledger-${entry.id}`,
      title: entry.kind === "credit" ? "Wallet top-up" : "Wallet debit",
      subtitle: entry.reason,
      amount: entry.amount,
      direction:
        entry.kind === "credit" ? ("credit" as const) : ("debit" as const),
      status: "completed",
      at: entry.at,
    })),
    ...orders.map((order) => ({
      id: `order-${order.id}`,
      title: `${order.provider} data bundle`,
      subtitle: `${order.bundleName} · ${order.recipient}`,
      amount: order.amount,
      direction: "debit" as const,
      status: order.status,
      at: order.at,
    })),
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      title: payment.billerName,
      subtitle: `${payment.category} · ${payment.customerNumber}`,
      amount: payment.amount,
      direction: "debit" as const,
      status: payment.status,
      at: payment.at,
    })),
  ]
    .sort((a, b) => Number(b.at - a.at))
    .slice(0, 6);

  const totalSpent = [...orders, ...payments].reduce(
    (sum, item) => sum + item.amount,
    0n,
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Your wallet at a glance, with quick actions to top up, buy data, or pay a bill."
      />

      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        <Card
          className="relative overflow-hidden border-border bg-gradient-subtle shadow-elevated md:col-span-2"
          data-ocid="dashboard.balance_card"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Wallet className="size-4" aria-hidden="true" />
              Wallet balance
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
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                asChild
                className="rounded-lg"
                data-ocid="dashboard.top_up_button"
              >
                <Link to="/wallet">
                  <Plus className="size-4" aria-hidden="true" />
                  Top up wallet
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-lg"
                data-ocid="dashboard.buy_data_button"
              >
                <Link to="/data">
                  <Smartphone className="size-4" aria-hidden="true" />
                  Buy data
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-lg"
                data-ocid="dashboard.pay_bill_button"
              >
                <Link to="/bills">
                  <ReceiptText className="size-4" aria-hidden="true" />
                  Pay a bill
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border shadow-subtle"
          data-ocid="dashboard.spend_card"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="size-4" aria-hidden="true" />
              Total spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono font-tabular text-3xl font-bold tracking-tight text-debit">
              {formatNaira(totalSpent)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Across {orders.length + payments.length} purchases
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Recent activity
          </h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-lg"
            data-ocid="dashboard.view_all_link"
          >
            <Link to="/transactions">
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {ledgerLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((id) => (
              <Skeleton key={id} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState
            ocid="dashboard.empty_state"
            icon={<Wallet className="size-6" aria-hidden="true" />}
            title="No activity yet"
            description="Top up your wallet to start buying data bundles and paying bills."
            action={
              <Button
                asChild
                className="rounded-lg"
                data-ocid="dashboard.empty_top_up_button"
              >
                <Link to="/wallet">Top up wallet</Link>
              </Button>
            }
          />
        ) : (
          <Card className="overflow-hidden border-border p-0 shadow-subtle">
            <ul className="divide-y divide-border">
              {activity.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-4 px-4 py-3.5 ${
                    item.direction === "credit"
                      ? "ledger-rail-credit"
                      : "ledger-rail-debit"
                  }`}
                  data-ocid="dashboard.activity_item"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Amount amount={item.amount} direction={item.direction} />
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(item.at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
