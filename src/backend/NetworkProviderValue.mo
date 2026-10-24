import OQL "mo:caffeineai-oql";
import CatalogTypes "types/catalog";

module {
  public func _toRow(self : CatalogTypes.NetworkProvider) : OQL.Value =
    #text(
      switch self {
        case (#mtn) "mtn";
        case (#airtel) "airtel";
        case (#glo) "glo";
        case (#nineMobile) "nineMobile";
      }
    );
};
