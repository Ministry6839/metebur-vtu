import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import Types "../types/transactions";
import TransactionsLib "../lib/transactions";

mixin (
  transactions : List.List<TransactionsLib.Transaction>,
) {
  public query ({ caller }) func listTransactions(
    filter : TransactionsLib.TransactionFilter,
  ) : async [TransactionsLib.Transaction] {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to view your transactions");
    };
    TransactionsLib.listTransactions(transactions, caller, filter);
  };

  public query ({ caller }) func getTransaction(id : Nat) : async ?TransactionsLib.Transaction {
    if (caller.isAnonymous()) {
      Runtime.trap("Sign in to view your transactions");
    };
    TransactionsLib.getTransaction(transactions, caller, id);
  };
};
