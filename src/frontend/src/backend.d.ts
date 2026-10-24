import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Amount = bigint;
export interface BillPayment {
    at: Timestamp;
    id: bigint;
    status: OrderStatus;
    billerName: string;
    customerNumber: string;
    owner: UserId;
    reference: Reference;
    billerId: bigint;
    category: string;
    amount: Amount;
}
export interface BillerView {
    id: bigint;
    name: string;
    enabled: boolean;
    category: BillCategory;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface DataBundleView {
    id: bigint;
    provider: NetworkProvider;
    name: string;
    validityDays: bigint;
    enabled: boolean;
    dataVolumeMb: bigint;
    price: Amount;
}
export interface DataOrder {
    at: Timestamp;
    id: bigint;
    status: OrderStatus;
    provider: string;
    owner: UserId;
    recipient: PhoneNumber;
    reference: Reference;
    bundleName: string;
    bundleId: bigint;
    amount: Amount;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface LedgerEntry {
    at: Timestamp;
    id: bigint;
    owner: UserId;
    kind: LedgerEntryKind;
    amount: Amount;
    reason: string;
}
export type OrderError = {
    __kind__: "insufficientFunds";
    insufficientFunds: {
        balance: Amount;
        required: Amount;
    };
} | {
    __kind__: "invalidInput";
    invalidInput: null;
} | {
    __kind__: "notFound";
    notFound: null;
} | {
    __kind__: "notSignedIn";
    notSignedIn: null;
};
export type PhoneNumber = string;
export type Reference = string;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export interface Transaction {
    at: Timestamp;
    id: bigint;
    status: string;
    owner: UserId;
    kind: TransactionType;
    reference: Reference;
    counterparty: string;
    amount: Amount;
}
export interface TransactionFilter {
    to?: Timestamp;
    from?: Timestamp;
    kind?: TransactionType;
    search?: string;
}
export type UserId = Principal;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface WalletView {
    balance: Amount;
    owner: UserId;
    createdAt: Timestamp;
}
export enum BillCategory {
    internet = "internet",
    electricity = "electricity",
    cableTv = "cableTv",
    airtime = "airtime"
}
export enum CatalogError {
    notAuthorized = "notAuthorized",
    invalidInput = "invalidInput",
    notFound = "notFound"
}
export enum LedgerEntryKind {
    credit = "credit",
    debit = "debit"
}
export enum NetworkProvider {
    glo = "glo",
    mtn = "mtn",
    nineMobile = "nineMobile",
    airtel = "airtel"
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum TransactionType {
    billPayment = "billPayment",
    topUp = "topUp",
    dataPurchase = "dataPurchase"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBiller(category: BillCategory, name: string): Promise<BillerView>;
    createDataBundle(provider: NetworkProvider, name: string, dataVolumeMb: bigint, validityDays: bigint, price: Amount): Promise<DataBundleView>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getMyLedger(): Promise<Array<LedgerEntry>>;
    getMyWallet(): Promise<WalletView>;
    getTransaction(id: bigint): Promise<Transaction | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllBillPayments(): Promise<Array<BillPayment>>;
    listAllDataOrders(): Promise<Array<DataOrder>>;
    listBillers(): Promise<Array<BillerView>>;
    listDataBundles(): Promise<Array<DataBundleView>>;
    listMyBillPayments(): Promise<Array<BillPayment>>;
    listMyDataOrders(): Promise<Array<DataOrder>>;
    listTransactions(filter: TransactionFilter): Promise<Array<Transaction>>;
    payBill(billerId: bigint, customerNumber: string, amount: Amount): Promise<{
        __kind__: "ok";
        ok: BillPayment;
    } | {
        __kind__: "err";
        err: OrderError;
    }>;
    purchaseDataBundle(bundleId: bigint, recipient: PhoneNumber): Promise<{
        __kind__: "ok";
        ok: DataOrder;
    } | {
        __kind__: "err";
        err: OrderError;
    }>;
    schema(): Promise<string>;
    topUpWallet(amount: Amount): Promise<LedgerEntry>;
    updateBiller(id: bigint, category: BillCategory, name: string, enabled: boolean): Promise<{
        __kind__: "ok";
        ok: BillerView;
    } | {
        __kind__: "err";
        err: CatalogError;
    }>;
    updateDataBundle(id: bigint, provider: NetworkProvider, name: string, dataVolumeMb: bigint, validityDays: bigint, price: Amount, enabled: boolean): Promise<{
        __kind__: "ok";
        ok: DataBundleView;
    } | {
        __kind__: "err";
        err: CatalogError;
    }>;
}
