import Map "mo:core/Map";
import List "mo:core/List";
import Common "../types/common";
import Types "../types/orders";

module {
  public type DataOrder = Types.DataOrder;
  public type BillPayment = Types.BillPayment;
  public type OrderError = Types.OrderError;

  public func listDataOrders(
    orders : List.List<DataOrder>,
    owner : Common.UserId,
  ) : [DataOrder] {
    orders.filter(func order = order.owner == owner).toArray();
  };

  public func listBillPayments(
    payments : List.List<BillPayment>,
    owner : Common.UserId,
  ) : [BillPayment] {
    payments.filter(func payment = payment.owner == owner).toArray();
  };

  public func listAllDataOrders(orders : List.List<DataOrder>) : [DataOrder] {
    orders.toArray();
  };

  public func listAllBillPayments(payments : List.List<BillPayment>) : [BillPayment] {
    payments.toArray();
  };

  public func recordDataOrder(
    orders : List.List<DataOrder>,
    nextOrderId : { var value : Nat },
    owner : Common.UserId,
    bundleId : Nat,
    provider : Text,
    bundleName : Text,
    recipient : Common.PhoneNumber,
    amount : Common.Amount,
    reference : Common.Reference,
    now : Common.Timestamp,
  ) : DataOrder {
    let order : DataOrder = {
      id = nextOrderId.value;
      owner;
      bundleId;
      provider;
      bundleName;
      recipient;
      amount;
      status = #completed;
      reference;
      at = now;
    };
    nextOrderId.value := nextOrderId.value + 1;
    orders.add(order);
    order;
  };

  public func recordBillPayment(
    payments : List.List<BillPayment>,
    nextPaymentId : { var value : Nat },
    owner : Common.UserId,
    billerId : Nat,
    billerName : Text,
    category : Text,
    customerNumber : Text,
    amount : Common.Amount,
    reference : Common.Reference,
    now : Common.Timestamp,
  ) : BillPayment {
    let payment : BillPayment = {
      id = nextPaymentId.value;
      owner;
      billerId;
      billerName;
      category;
      customerNumber;
      amount;
      status = #completed;
      reference;
      at = now;
    };
    nextPaymentId.value := nextPaymentId.value + 1;
    payments.add(payment);
    payment;
  };
};
