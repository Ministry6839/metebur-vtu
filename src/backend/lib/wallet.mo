import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Common "../types/common";
import Types "../types/wallet";

module {
  public type Wallet = Types.Wallet;
  public type WalletView = Types.WalletView;
  public type LedgerEntry = Types.LedgerEntry;
  public type WalletError = Types.WalletError;

  public func toView(self : Wallet) : WalletView {
    {
      owner = self.owner;
      balance = self.balance;
      createdAt = self.createdAt;
    };
  };

  public func getOrCreate(
    wallets : Map.Map<Common.UserId, Wallet>,
    owner : Common.UserId,
    now : Common.Timestamp,
  ) : Wallet {
    switch (wallets.get(owner)) {
      case (?wallet) { wallet };
      case (null) {
        let wallet : Wallet = { owner; var balance = 0; createdAt = now };
        wallets.add(owner, wallet);
        wallet;
      };
    };
  };

  public func credit(
    wallets : Map.Map<Common.UserId, Wallet>,
    ledger : List.List<LedgerEntry>,
    nextLedgerId : { var value : Nat },
    owner : Common.UserId,
    amount : Common.Amount,
    reason : Text,
    now : Common.Timestamp,
  ) : LedgerEntry {
    let wallet = getOrCreate(wallets, owner, now);
    wallet.balance := wallet.balance + amount;
    let entry : LedgerEntry = {
      id = nextLedgerId.value;
      owner;
      kind = #credit;
      amount;
      reason;
      at = now;
    };
    nextLedgerId.value := nextLedgerId.value + 1;
    ledger.add(entry);
    entry;
  };

  public func debit(
    wallets : Map.Map<Common.UserId, Wallet>,
    ledger : List.List<LedgerEntry>,
    nextLedgerId : { var value : Nat },
    owner : Common.UserId,
    amount : Common.Amount,
    reason : Text,
    now : Common.Timestamp,
  ) : { #ok : LedgerEntry; #err : WalletError } {
    if (amount == 0) {
      return #err(#invalidAmount);
    };
    let wallet = getOrCreate(wallets, owner, now);
    if (wallet.balance < amount) {
      return #err(#insufficientFunds({ balance = wallet.balance; required = amount }));
    };
    wallet.balance := wallet.balance - amount;
    let entry : LedgerEntry = {
      id = nextLedgerId.value;
      owner;
      kind = #debit;
      amount;
      reason;
      at = now;
    };
    nextLedgerId.value := nextLedgerId.value + 1;
    ledger.add(entry);
    #ok(entry);
  };

  public func listLedger(
    ledger : List.List<LedgerEntry>,
    owner : Common.UserId,
  ) : [LedgerEntry] {
    ledger.filter(func entry = entry.owner == owner).toArray();
  };
};
