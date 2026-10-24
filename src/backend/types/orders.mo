import Common "common";

module {
  public type OrderStatus = {
    #pending;
    #completed;
    #failed;
  };

  public type DataOrder = {
    id : Nat;
    owner : Common.UserId;
    bundleId : Nat;
    provider : Text;
    bundleName : Text;
    recipient : Common.PhoneNumber;
    amount : Common.Amount;
    status : OrderStatus;
    reference : Common.Reference;
    at : Common.Timestamp;
  };

  public type BillPayment = {
    id : Nat;
    owner : Common.UserId;
    billerId : Nat;
    billerName : Text;
    category : Text;
    customerNumber : Text;
    amount : Common.Amount;
    status : OrderStatus;
    reference : Common.Reference;
    at : Common.Timestamp;
  };

  public type OrderError = {
    #notSignedIn;
    #notFound;
    #insufficientFunds : { balance : Common.Amount; required : Common.Amount };
    #invalidInput;
  };
};
