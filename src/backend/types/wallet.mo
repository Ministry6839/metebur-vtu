import Common "common";

module {
  public type Wallet = {
    owner : Common.UserId;
    var balance : Common.Amount;
    createdAt : Common.Timestamp;
  };

  public type WalletView = {
    owner : Common.UserId;
    balance : Common.Amount;
    createdAt : Common.Timestamp;
  };

  public type LedgerEntryKind = {
    #credit;
    #debit;
  };

  public type LedgerEntry = {
    id : Nat;
    owner : Common.UserId;
    kind : LedgerEntryKind;
    amount : Common.Amount;
    reason : Text;
    at : Common.Timestamp;
  };

  public type WalletError = {
    #notSignedIn;
    #insufficientFunds : { balance : Common.Amount; required : Common.Amount };
    #invalidAmount;
  };
};
