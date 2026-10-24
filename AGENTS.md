# Project Guidance

## User Preferences

- Core product is bill payment and mobile data reselling
- Wallet-based purchase flows with clear confirmation steps
- Clear navigation hierarchy and comfortable information density

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Amounts are stored as kobo bigints; formatNaira divides by 100 and Intl NGN renders the naira sign
- purchaseDataBundle and payBill return {__kind__:'ok'|'err'} result variants; check result.__kind__ then result.err.__kind__
- getMyWallet is a query returning a zero-balance view with createdAt=0 for new users; guard epoch timestamps before formatting
- topUpWallet must call TransactionsLib.record so top-ups appear in unified history
- OQL Value has no variant case: ship <Type>Value.mo with _toRow returning #text(tag) and import it top-level in main.mo
- getApiDoc belongs in its own src/backend/mixins/api-doc.mo mixin included from main.mo; Motoko has no triple-quoted strings
- getOrCreate inside a query func silently discards the write; read the map and return a zero-balance view instead
- Time.now() returns Int and Common.Timestamp is Nat; convert with Time.now().toNat()
- useInternetIdentity exposes isAuthenticated (not isLoginSuccess) for gating
- Local preflight could not verify runtime behavior this build (tester_error); the app tree was recorded as deployable without a browser pass
