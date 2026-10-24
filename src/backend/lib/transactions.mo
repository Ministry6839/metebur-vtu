import List "mo:core/List";
import Common "../types/common";
import Types "../types/transactions";

module {
  public type Transaction = Types.Transaction;
  public type TransactionFilter = Types.TransactionFilter;

  func matches(transaction : Transaction, filter : TransactionFilter) : Bool {
    let kindOk = switch (filter.kind) {
      case (null) { true };
      case (?kind) { transaction.kind == kind };
    };
    let fromOk = switch (filter.from) {
      case (null) { true };
      case (?from) { transaction.at >= from };
    };
    let toOk = switch (filter.to) {
      case (null) { true };
      case (?to) { transaction.at <= to };
    };
    let searchOk = switch (filter.search) {
      case (null) { true };
      case (?term) {
        let needle = term.toLower();
        transaction.reference.toLower().contains(#text needle)
          or transaction.counterparty.toLower().contains(#text needle);
      };
    };
    kindOk and fromOk and toOk and searchOk;
  };

  public func listTransactions(
    transactions : List.List<Transaction>,
    owner : Common.UserId,
    filter : TransactionFilter,
  ) : [Transaction] {
    transactions.filter(func transaction = transaction.owner == owner and matches(transaction, filter)).toArray();
  };

  public func getTransaction(
    transactions : List.List<Transaction>,
    owner : Common.UserId,
    id : Nat,
  ) : ?Transaction {
    transactions.find(func transaction = transaction.owner == owner and transaction.id == id);
  };

  public func record(
    transactions : List.List<Transaction>,
    nextTransactionId : { var value : Nat },
    owner : Common.UserId,
    kind : Types.TransactionType,
    amount : Common.Amount,
    status : Text,
    reference : Common.Reference,
    counterparty : Text,
    now : Common.Timestamp,
  ) : Transaction {
    let transaction : Transaction = {
      id = nextTransactionId.value;
      owner;
      kind;
      amount;
      status;
      reference;
      counterparty;
      at = now;
    };
    nextTransactionId.value := nextTransactionId.value + 1;
    transactions.add(transaction);
    transaction;
  };
};
