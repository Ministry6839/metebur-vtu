import type { TransactionFilter } from "@/types";

/** Centralized React Query keys so mutations invalidate the right caches. */
export const queryKeys = {
  wallet: ["wallet"] as const,
  ledger: ["ledger"] as const,
  transactions: (filter: TransactionFilter) =>
    ["transactions", filter] as const,
  transaction: (id: bigint) => ["transaction", id.toString()] as const,
  dataBundles: ["dataBundles"] as const,
  billers: ["billers"] as const,
  myDataOrders: ["myDataOrders"] as const,
  myBillPayments: ["myBillPayments"] as const,
  allDataOrders: ["allDataOrders"] as const,
  allBillPayments: ["allBillPayments"] as const,
  isAdmin: ["isAdmin"] as const,
  userRole: ["userRole"] as const,
};

/** Every key that a wallet-affecting mutation should refresh. */
export const walletAffectedKeys = [
  queryKeys.wallet,
  queryKeys.ledger,
  queryKeys.myDataOrders,
  queryKeys.myBillPayments,
  queryKeys.allDataOrders,
  queryKeys.allBillPayments,
] as const;
