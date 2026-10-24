import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import Types "../types/wallet";
import WalletLib "../lib/wallet";
import TransactionsLib "../lib/transactions";


mixin (
  wallets : Map.Map<Common.UserId, WalletLib.Wallet>,
  ledger : List.List<WalletLib.LedgerEntry>,
  nextLedgerId : { var value : Nat },
  transactions : List.List<TransactionsLib.Transaction>,
  nextTransactionId : { var value : Nat },
) {
  public query ({ caller }) func getMyWallet() : async WalletLib.WalletView {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to view your wallet");
    };
    switch (wallets.get(caller)) {
      case (?wallet) { wallet.toView() };
      case (null) {
        { owner = caller; balance = 0; createdAt = 0 };
      };
    };
  };

  public query ({ caller }) func getMyLedger() : async [WalletLib.LedgerEntry] {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to view your ledger");
    };
    WalletLib.listLedger(ledger, caller);
  };

  public shared ({ caller }) func topUpWallet(amount : Common.Amount) : async WalletLib.LedgerEntry {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to top up your wallet");
    };
    if (amount == 0) {
      Runtime.trap("Top-up amount must be greater than zero");
    };
    let now = Time.now().toNat();
    let entry = WalletLib.credit(wallets, ledger, nextLedgerId, caller, amount, "Wallet top-up", now);
    ignore TransactionsLib.record(
      transactions,
      nextTransactionId,
      caller,
      #topUp,
      amount,
      "completed",
      "TOPUP-" # entry.id.toText(),
      "Wallet top-up",
      now,
    );
    entry;
  };
};
