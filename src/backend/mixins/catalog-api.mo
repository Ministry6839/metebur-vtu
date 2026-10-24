import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Types "../types/catalog";
import CatalogLib "../lib/catalog";

mixin (
  accessControlState : AccessControl.AccessControlState,
  bundles : Map.Map<Nat, CatalogLib.DataBundle>,
  billers : Map.Map<Nat, CatalogLib.Biller>,
  nextBundleId : { var value : Nat },
  nextBillerId : { var value : Nat },
) {
  public query func listDataBundles() : async [CatalogLib.DataBundleView] {
    CatalogLib.listBundles(bundles, false);
  };

  public query func listBillers() : async [CatalogLib.BillerView] {
    CatalogLib.listBillers(billers, false);
  };

  public shared ({ caller }) func createDataBundle(
    provider : Types.NetworkProvider,
    name : Text,
    dataVolumeMb : Nat,
    validityDays : Nat,
    price : Common.Amount,
  ) : async CatalogLib.DataBundleView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage the catalog");
    };
    CatalogLib.createBundle(bundles, nextBundleId, provider, name, dataVolumeMb, validityDays, price);
  };

  public shared ({ caller }) func updateDataBundle(
    id : Nat,
    provider : Types.NetworkProvider,
    name : Text,
    dataVolumeMb : Nat,
    validityDays : Nat,
    price : Common.Amount,
    enabled : Bool,
  ) : async { #ok : CatalogLib.DataBundleView; #err : CatalogLib.CatalogError } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage the catalog");
    };
    CatalogLib.updateBundle(bundles, id, provider, name, dataVolumeMb, validityDays, price, enabled);
  };

  public shared ({ caller }) func createBiller(
    category : Types.BillCategory,
    name : Text,
  ) : async CatalogLib.BillerView {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage the catalog");
    };
    CatalogLib.createBiller(billers, nextBillerId, category, name);
  };

  public shared ({ caller }) func updateBiller(
    id : Nat,
    category : Types.BillCategory,
    name : Text,
    enabled : Bool,
  ) : async { #ok : CatalogLib.BillerView; #err : CatalogLib.CatalogError } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage the catalog");
    };
    CatalogLib.updateBiller(billers, id, category, name, enabled);
  };
};
