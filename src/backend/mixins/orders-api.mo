import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import CatalogTypes "../types/catalog";
import OrderTypes "../types/orders";
import WalletTypes "../types/wallet";
import TransactionTypes "../types/transactions";
import CatalogLib "../lib/catalog";
import OrdersLib "../lib/orders";
import WalletLib "../lib/wallet";
import TransactionsLib "../lib/transactions";

mixin (
  accessControlState : AccessControl.AccessControlState,
  wallets : Map.Map<Common.UserId, WalletLib.Wallet>,
  ledger : List.List<WalletLib.LedgerEntry>,
  nextLedgerId : { var value : Nat },
  bundles : Map.Map<Nat, CatalogLib.DataBundle>,
  billers : Map.Map<Nat, CatalogLib.Biller>,
  dataOrders : List.List<OrdersLib.DataOrder>,
  billPayments : List.List<OrdersLib.BillPayment>,
  nextOrderId : { var value : Nat },
  nextPaymentId : { var value : Nat },
  transactions : List.List<TransactionsLib.Transaction>,
  nextTransactionId : { var value : Nat },
) {
  func providerLabel(provider : CatalogTypes.NetworkProvider) : Text {
    switch (provider) {
      case (#mtn) { "MTN" };
      case (#airtel) { "Airtel" };
      case (#glo) { "Glo" };
      case (#nineMobile) { "9mobile" };
    };
  };

  func categoryLabel(category : CatalogTypes.BillCategory) : Text {
    switch (category) {
      case (#electricity) { "Electricity" };
      case (#airtime) { "Airtime" };
      case (#cableTv) { "Cable TV" };
      case (#internet) { "Internet" };
    };
  };

  func makeReference(prefix : Text, id : Nat) : Text {
    prefix # "-" # id.toText();
  };

  public shared ({ caller }) func purchaseDataBundle(
    bundleId : Nat,
    recipient : Common.PhoneNumber,
  ) : async { #ok : OrdersLib.DataOrder; #err : OrdersLib.OrderError } {
    if (caller.isAnonymous()) {
      return #err(#notSignedIn);
    };
    if (recipient == "") {
      return #err(#invalidInput);
    };
    let bundle = switch (bundles.get(bundleId)) {
      case (null) { return #err(#notFound) };
      case (?bundle) { bundle };
    };
    if (not bundle.enabled) {
      return #err(#notFound);
    };
    let now = Time.now().toNat();
    let reference = makeReference("DATA", nextOrderId.value);
    switch (WalletLib.debit(wallets, ledger, nextLedgerId, caller, bundle.price, "Data bundle purchase", now)) {
      case (#err(#insufficientFunds({ balance; required }))) {
        return #err(#insufficientFunds({ balance; required }));
      };
      case (#err(#invalidAmount)) { return #err(#invalidInput) };
      case (#err(#notSignedIn)) { return #err(#notSignedIn) };
      case (#ok(_)) {};
    };
    let order = OrdersLib.recordDataOrder(
      dataOrders,
      nextOrderId,
      caller,
      bundleId,
      providerLabel(bundle.provider),
      bundle.name,
      recipient,
      bundle.price,
      reference,
      now,
    );
    ignore TransactionsLib.record(
      transactions,
      nextTransactionId,
      caller,
      #dataPurchase,
      bundle.price,
      "completed",
      reference,
      recipient,
      now,
    );
    #ok(order);
  };

  public shared ({ caller }) func payBill(
    billerId : Nat,
    customerNumber : Text,
    amount : Common.Amount,
  ) : async { #ok : OrdersLib.BillPayment; #err : OrdersLib.OrderError } {
    if (caller.isAnonymous()) {
      return #err(#notSignedIn);
    };
    if (customerNumber == "" or amount == 0) {
      return #err(#invalidInput);
    };
    let biller = switch (billers.get(billerId)) {
      case (null) { return #err(#notFound) };
      case (?biller) { biller };
    };
    if (not biller.enabled) {
      return #err(#notFound);
    };
    let now = Time.now().toNat();
    let reference = makeReference("BILL", nextPaymentId.value);
    switch (WalletLib.debit(wallets, ledger, nextLedgerId, caller, amount, "Bill payment", now)) {
      case (#err(#insufficientFunds({ balance; required }))) {
        return #err(#insufficientFunds({ balance; required }));
      };
      case (#err(#invalidAmount)) { return #err(#invalidInput) };
      case (#err(#notSignedIn)) { return #err(#notSignedIn) };
      case (#ok(_)) {};
    };
    let payment = OrdersLib.recordBillPayment(
      billPayments,
      nextPaymentId,
      caller,
      billerId,
      biller.name,
      categoryLabel(biller.category),
      customerNumber,
      amount,
      reference,
      now,
    );
    ignore TransactionsLib.record(
      transactions,
      nextTransactionId,
      caller,
      #billPayment,
      amount,
      "completed",
      reference,
      customerNumber,
      now,
    );
    #ok(payment);
  };

  public query ({ caller }) func listMyDataOrders() : async [OrdersLib.DataOrder] {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to view your orders");
    };
    OrdersLib.listDataOrders(dataOrders, caller);
  };

  public query ({ caller }) func listMyBillPayments() : async [OrdersLib.BillPayment] {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to view your payments");
    };
    OrdersLib.listBillPayments(billPayments, caller);
  };

  public query ({ caller }) func listAllDataOrders() : async [OrdersLib.DataOrder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    OrdersLib.listAllDataOrders(dataOrders);
  };

  public query ({ caller }) func listAllBillPayments() : async [OrdersLib.BillPayment] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all payments");
    };
    OrdersLib.listAllBillPayments(billPayments);
  };
};
