import OQL "mo:caffeineai-oql";
import CatalogTypes "types/catalog";

module {
  public func _toRow(self : CatalogTypes.BillCategory) : OQL.Value =
    #text(
      switch self {
        case (#electricity) "electricity";
        case (#airtime) "airtime";
        case (#cableTv) "cableTv";
        case (#internet) "internet";
      }
    );
};
