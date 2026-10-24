import { createActor } from "@/backend";
import { queryKeys, walletAffectedKeys } from "@/lib/queries";
import type {
  BillPayment,
  BillerView,
  DataBundleView,
  DataOrder,
  Transaction,
  TransactionFilter,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Unified transaction history for the signed-in user, filtered server-side. */
export function useTransactions(filter: TransactionFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Transaction[]>({
    queryKey: queryKeys.transactions(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTransactions(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single transaction by id, for the receipt detail view. */
export function useTransaction(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Transaction | null>({
    queryKey: queryKeys.transaction(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getTransaction(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/** All enabled data bundles offered for purchase. */
export function useDataBundles() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DataBundleView[]>({
    queryKey: queryKeys.dataBundles,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDataBundles();
    },
    enabled: !!actor && !isFetching,
  });
}

/** All billers grouped by category. */
export function useBillers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BillerView[]>({
    queryKey: queryKeys.billers,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBillers();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The signed-in user's own data orders. */
export function useMyDataOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DataOrder[]>({
    queryKey: queryKeys.myDataOrders,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyDataOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The signed-in user's own bill payments. */
export function useMyBillPayments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BillPayment[]>({
    queryKey: queryKeys.myBillPayments,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyBillPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Admin: every data order across all users. */
export function useAllDataOrders(enabled: boolean) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DataOrder[]>({
    queryKey: queryKeys.allDataOrders,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllDataOrders();
    },
    enabled: enabled && !!actor && !isFetching,
  });
}

/** Admin: every bill payment across all users. */
export function useAllBillPayments(enabled: boolean) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BillPayment[]>({
    queryKey: queryKeys.allBillPayments,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllBillPayments();
    },
    enabled: enabled && !!actor && !isFetching,
  });
}

/** Purchase a data bundle for a recipient phone number. */
export function usePurchaseDataBundle() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { bundleId: bigint; recipient: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.purchaseDataBundle(args.bundleId, args.recipient);
    },
    onSuccess: () => {
      for (const key of walletAffectedKeys) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

/** Pay a bill for a biller with a customer/meter number and amount. */
export function usePayBill() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      billerId: bigint;
      customerNumber: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.payBill(args.billerId, args.customerNumber, args.amount);
    },
    onSuccess: () => {
      for (const key of walletAffectedKeys) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
