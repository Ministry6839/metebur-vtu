import type {
  BillPayment,
  BillerView,
  DataBundleView,
  DataOrder,
  LedgerEntry,
  Transaction,
  TransactionFilter,
  WalletView,
} from "@/backend";

// Value enums — re-exported as values so consumers can use `NetworkProvider.mtn`,
// `TransactionType.topUp`, etc. in comparisons and switches.
export {
  BillCategory,
  CatalogError,
  LedgerEntryKind,
  NetworkProvider,
  OrderStatus,
  TransactionType,
  UserRole,
} from "@/backend";

export type {
  Amount,
  BillPayment,
  BillerView,
  DataBundleView,
  DataOrder,
  LedgerEntry,
  OrderError,
  PhoneNumber,
  Reference,
  Timestamp,
  Transaction,
  TransactionFilter,
  WalletView,
} from "@/backend";

/** A unified ledger row used by the transaction history view. */
export interface HistoryRow {
  id: bigint;
  kind: "topUp" | "dataPurchase" | "billPayment";
  title: string;
  counterparty: string;
  reference: string;
  amount: bigint;
  direction: "credit" | "debit";
  status: string;
  at: bigint;
}

export type { Transaction as TransactionRecord };

/** Human labels for the four Nigerian mobile networks. */
export const NETWORK_LABELS: Record<string, string> = {
  mtn: "MTN",
  airtel: "Airtel",
  glo: "Glo",
  nineMobile: "9mobile",
};

/** Human labels for bill categories. */
export const CATEGORY_LABELS: Record<string, string> = {
  electricity: "Electricity",
  airtime: "Airtime",
  cableTv: "Cable TV",
  internet: "Internet",
};

export type { BillPayment as BillPaymentRecord, DataOrder as DataOrderRecord };
export type { WalletView as Wallet };
export type { TransactionFilter as TxFilter };
