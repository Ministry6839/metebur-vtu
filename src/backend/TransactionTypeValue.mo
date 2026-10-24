import OQL "mo:caffeineai-oql";
import TransactionTypes "types/transactions";

module {
  public func _toRow(self : TransactionTypes.TransactionType) : OQL.Value =
    #text(
      switch self {
        case (#topUp) "topUp";
        case (#dataPurchase) "dataPurchase";
        case (#billPayment) "billPayment";
      }
    );
};
