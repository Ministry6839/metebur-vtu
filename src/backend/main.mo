import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import ListEntity "mo:caffeineai-oql/ListEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import BoolValue "mo:caffeineai-oql/BoolValue";

import NetworkProviderValue "./NetworkProviderValue";
import BillCategoryValue "./BillCategoryValue";
import OrderStatusValue "./OrderStatusValue";
import TransactionTypeValue "./TransactionTypeValue";

import Common "types/common";
import WalletTypes "types/wallet";
import CatalogTypes "types/catalog";
import OrderTypes "types/orders";
import TransactionTypes "types/transactions";

import WalletLib "lib/wallet";
import CatalogLib "lib/catalog";
import OrdersLib "lib/orders";
import TransactionsLib "lib/transactions";

import WalletApi "mixins/wallet-api";
import CatalogApi "mixins/catalog-api";
import OrdersApi "mixins/orders-api";
import TransactionsApi "mixins/transactions-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let wallets : Map.Map<Common.UserId, WalletLib.Wallet>;
  let ledger : List.List<WalletLib.LedgerEntry>;
  let nextLedgerId : { var value : Nat };

  let bundles : Map.Map<Nat, CatalogLib.DataBundle>;
  let billers : Map.Map<Nat, CatalogLib.Biller>;
  let nextBundleId : { var value : Nat };
  let nextBillerId : { var value : Nat };

  let dataOrders : List.List<OrdersLib.DataOrder>;
  let billPayments : List.List<OrdersLib.BillPayment>;
  let nextOrderId : { var value : Nat };
  let nextPaymentId : { var value : Nat };

  let transactions : List.List<TransactionsLib.Transaction>;
  let nextTransactionId : { var value : Nat };

  include MixinAuthorization(accessControlState, null);

  include WalletApi(wallets, ledger, nextLedgerId, transactions, nextTransactionId);
  include CatalogApi(accessControlState, bundles, billers, nextBundleId, nextBillerId);
  include OrdersApi(
    accessControlState,
    wallets,
    ledger,
    nextLedgerId,
    bundles,
    billers,
    dataOrders,
    billPayments,
    nextOrderId,
    nextPaymentId,
    transactions,
    nextTransactionId,
  );
  include TransactionsApi(transactions);

  include ApiDocMixin();

  include Expose({
    entities = [
      bundles.toEntity("dataBundle", "DataBundle", "id")
        .sample({
          id = 0;
          provider = #mtn;
          name = "";
          dataVolumeMb = 0;
          validityDays = 0;
          price = 0;
          var enabled = true;
        } : CatalogLib.DataBundle)
        .public_()
        .build(),
      billers.toEntity("biller", "Biller", "id")
        .sample({
          id = 0;
          category = #electricity;
          name = "";
          var enabled = true;
        } : CatalogLib.Biller)
        .public_()
        .build(),
      dataOrders.toEntity("dataOrder", "DataOrder", "id")
        .sample({
          id = 0;
          owner = Principal.fromText("aaaaa-aa");
          bundleId = 0;
          provider = "";
          bundleName = "";
          recipient = "";
          amount = 0;
          status = #completed;
          reference = "";
          at = 0;
        })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      billPayments.toEntity("billPayment", "BillPayment", "id")
        .sample({
          id = 0;
          owner = Principal.fromText("aaaaa-aa");
          billerId = 0;
          billerName = "";
          category = "";
          customerNumber = "";
          amount = 0;
          status = #completed;
          reference = "";
          at = 0;
        })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      transactions.toEntity("transaction", "Transaction", "id")
        .sample({
          id = 0;
          owner = Principal.fromText("aaaaa-aa");
          kind = #topUp;
          amount = 0;
          status = "";
          reference = "";
          counterparty = "";
          at = 0;
        })
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
    ];
  });
};
