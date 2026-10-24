import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    wallets : Map.Map<Principal, Wallet>;
    ledger : List.List<LedgerEntry>;
    nextLedgerId : { var value : Nat };
    bundles : Map.Map<Nat, DataBundle>;
    billers : Map.Map<Nat, Biller>;
    nextBundleId : { var value : Nat };
    nextBillerId : { var value : Nat };
    dataOrders : List.List<DataOrder>;
    billPayments : List.List<BillPayment>;
    nextOrderId : { var value : Nat };
    nextPaymentId : { var value : Nat };
    transactions : List.List<Transaction>;
    nextTransactionId : { var value : Nat };
  };

  type Wallet = {
    owner : Principal;
    var balance : Nat;
    createdAt : Nat;
  };

  type LedgerEntry = {
    id : Nat;
    owner : Principal;
    kind : { #credit; #debit };
    amount : Nat;
    reason : Text;
    at : Nat;
  };

  type DataBundle = {
    id : Nat;
    provider : { #mtn; #airtel; #glo; #nineMobile };
    name : Text;
    dataVolumeMb : Nat;
    validityDays : Nat;
    price : Nat;
    var enabled : Bool;
  };

  type Biller = {
    id : Nat;
    category : { #electricity; #airtime; #cableTv; #internet };
    name : Text;
    var enabled : Bool;
  };

  type DataOrder = {
    id : Nat;
    owner : Principal;
    bundleId : Nat;
    provider : Text;
    bundleName : Text;
    recipient : Text;
    amount : Nat;
    status : { #pending; #completed; #failed };
    reference : Text;
    at : Nat;
  };

  type BillPayment = {
    id : Nat;
    owner : Principal;
    billerId : Nat;
    billerName : Text;
    category : Text;
    customerNumber : Text;
    amount : Nat;
    status : { #pending; #completed; #failed };
    reference : Text;
    at : Nat;
  };

  type Transaction = {
    id : Nat;
    owner : Principal;
    kind : { #topUp; #dataPurchase; #billPayment };
    amount : Nat;
    status : Text;
    reference : Text;
    counterparty : Text;
    at : Nat;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      wallets = Map.empty();
      ledger = List.empty();
      nextLedgerId = { var value = 0 };
      bundles = Map.empty();
      billers = Map.empty();
      nextBundleId = { var value = 0 };
      nextBillerId = { var value = 0 };
      dataOrders = List.empty();
      billPayments = List.empty();
      nextOrderId = { var value = 0 };
      nextPaymentId = { var value = 0 };
      transactions = List.empty();
      nextTransactionId = { var value = 0 };
    };
  };
};
