import OQL "mo:caffeineai-oql";
import OrderTypes "types/orders";

module {
  public func _toRow(self : OrderTypes.OrderStatus) : OQL.Value =
    #text(
      switch self {
        case (#pending) "pending";
        case (#completed) "completed";
        case (#failed) "failed";
      }
    );
};
