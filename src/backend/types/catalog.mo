import Common "common";

module {
  public type NetworkProvider = {
    #mtn;
    #airtel;
    #glo;
    #nineMobile;
  };

  public type DataBundle = {
    id : Nat;
    provider : NetworkProvider;
    name : Text;
    dataVolumeMb : Nat;
    validityDays : Nat;
    price : Common.Amount;
    var enabled : Bool;
  };

  public type DataBundleView = {
    id : Nat;
    provider : NetworkProvider;
    name : Text;
    dataVolumeMb : Nat;
    validityDays : Nat;
    price : Common.Amount;
    enabled : Bool;
  };

  public type BillCategory = {
    #electricity;
    #airtime;
    #cableTv;
    #internet;
  };

  public type Biller = {
    id : Nat;
    category : BillCategory;
    name : Text;
    var enabled : Bool;
  };

  public type BillerView = {
    id : Nat;
    category : BillCategory;
    name : Text;
    enabled : Bool;
  };

  public type CatalogError = {
    #notFound;
    #notAuthorized;
    #invalidInput;
  };
};
