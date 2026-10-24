import { createActor } from "@/backend";
import { queryKeys, walletAffectedKeys } from "@/lib/queries";
import type { LedgerEntry, WalletView } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The signed-in user's wallet balance and metadata. */
export function useWallet() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<WalletView | null>({
    queryKey: queryKeys.wallet,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyWallet();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The signed-in user's full credit/debit ledger. */
export function useLedger() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<LedgerEntry[]>({
    queryKey: queryKeys.ledger,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyLedger();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Top up the wallet by an amount in kobo. */
export function useTopUpWallet() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.topUpWallet(amount);
    },
    onSuccess: () => {
      for (const key of walletAffectedKeys) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

/** Whether the signed-in caller holds the admin role. */
export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: queryKeys.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
