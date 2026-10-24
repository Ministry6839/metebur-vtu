import Common "common";

module {
  public type TransactionType = {
    #topUp;
    #dataPurchase;
    #billPayment;
  };

  public type Transaction = {
    id : Nat;
    owner : Common.UserId;
    kind : TransactionType;
    amount : Common.Amount;
    status : Text;
    reference : Common.Reference;
    counterparty : Text;
    at : Common.Timestamp;
  };

  public type TransactionFilter = {
    kind : ?TransactionType;
    from : ?Common.Timestamp;
    to : ?Common.Timestamp;
    search : ?Text;
  };
};
