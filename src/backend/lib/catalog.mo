import Map "mo:core/Map";
import Common "../types/common";
import Types "../types/catalog";

module {
  public type DataBundle = Types.DataBundle;
  public type DataBundleView = Types.DataBundleView;
  public type Biller = Types.Biller;
  public type BillerView = Types.BillerView;
  public type CatalogError = Types.CatalogError;

  public func bundleToView(self : DataBundle) : DataBundleView {
    {
      id = self.id;
      provider = self.provider;
      name = self.name;
      dataVolumeMb = self.dataVolumeMb;
      validityDays = self.validityDays;
      price = self.price;
      enabled = self.enabled;
    };
  };

  public func billerToView(self : Biller) : BillerView {
    {
      id = self.id;
      category = self.category;
      name = self.name;
      enabled = self.enabled;
    };
  };

  public func listBundles(
    bundles : Map.Map<Nat, DataBundle>,
    includeDisabled : Bool,
  ) : [DataBundleView] {
    bundles.values().filter(func bundle = includeDisabled or bundle.enabled).map(bundleToView).toArray();
  };

  public func listBillers(
    billers : Map.Map<Nat, Biller>,
    includeDisabled : Bool,
  ) : [BillerView] {
    billers.values().filter(func biller = includeDisabled or biller.enabled).map(billerToView).toArray();
  };

  public func createBundle(
    bundles : Map.Map<Nat, DataBundle>,
    nextBundleId : { var value : Nat },
    provider : Types.NetworkProvider,
    name : Text,
    dataVolumeMb : Nat,
    validityDays : Nat,
    price : Common.Amount,
  ) : DataBundleView {
    let id = nextBundleId.value;
    nextBundleId.value := id + 1;
    let bundle : DataBundle = {
      id;
      provider;
      name;
      dataVolumeMb;
      validityDays;
      price;
      var enabled = true;
    };
    bundles.add(id, bundle);
    bundleToView(bundle);
  };

  public func updateBundle(
    bundles : Map.Map<Nat, DataBundle>,
    id : Nat,
    provider : Types.NetworkProvider,
    name : Text,
    dataVolumeMb : Nat,
    validityDays : Nat,
    price : Common.Amount,
    enabled : Bool,
  ) : { #ok : DataBundleView; #err : CatalogError } {
    switch (bundles.get(id)) {
      case (null) { #err(#notFound) };
      case (?bundle) {
        let updated : DataBundle = {
          id;
          provider;
          name;
          dataVolumeMb;
          validityDays;
          price;
          var enabled = enabled;
        };
        bundles.add(id, updated);
        #ok(bundleToView(updated));
      };
    };
  };

  public func createBiller(
    billers : Map.Map<Nat, Biller>,
    nextBillerId : { var value : Nat },
    category : Types.BillCategory,
    name : Text,
  ) : BillerView {
    let id = nextBillerId.value;
    nextBillerId.value := id + 1;
    let biller : Biller = { id; category; name; var enabled = true };
    billers.add(id, biller);
    billerToView(biller);
  };

  public func updateBiller(
    billers : Map.Map<Nat, Biller>,
    id : Nat,
    category : Types.BillCategory,
    name : Text,
    enabled : Bool,
  ) : { #ok : BillerView; #err : CatalogError } {
    switch (billers.get(id)) {
      case (null) { #err(#notFound) };
      case (?biller) {
        let updated : Biller = { id; category; name; var enabled = enabled };
        billers.add(id, updated);
        #ok(billerToView(updated));
      };
    };
  };
};
