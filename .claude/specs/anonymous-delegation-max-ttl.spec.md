# Spec: Honor maxTimeToLive for anonymous canister-signed delegations

> Status: APPROVED
> Created: 2026-11-19

## Overview

`getAnonymousDelegation()` (`packages/integration/src/lib/delegation-factory/delegation-i.ts`)
receives a `maxTimeToLive` from its callers, but for accounts whose anchor is
`>= ANCHOR_TO_GET_DELEGATION_FROM_DF` (200 000 000, i.e. every account that gets delegations
from the delegation factory canister) it does not forward it to
`getDelegationChainSignedByCanister()`. The canister is then asked for its default
2-hour lifetime regardless of what the dApp requested.

Since `@icp-sdk/signer` 5.6.x, the relying-party side validates the returned chain
(`assertLifetime`): a delegation that expires more than 5 minutes later than the requested
`maxTimeToLive` is rejected with
`"Returned delegation expires later than the requested maxTimeToLive"`. IdentityKit requests
30 minutes by default, so connecting to an IdentityKit dApp with **Delegation** auth and an
**anonymous ("application-specific address") profile** fails for every account with
anchor >= 200 000 000. The global/public profile works because `getGlobalDelegationChain()`
already forwards `maxTimeToLive`. Legacy anchors (< 200 000 000) go through the lambda path,
which already honors the value.

Found via the identitykit e2e suite (react-demo, "Delegation login method with legacy_0
profile") after moving it to new dev test accounts 200000293/200000294.

## Scope

- **App/area:** `packages/integration/src/lib/delegation-factory/delegation-i.ts`
  (`getAnonymousDelegation`), shared `@nfid/integration` package. Integration layer only —
  no UI changes.
- **Entry points (unchanged callers):**
  - ICRC-34 `icrc34_delegation` with an anonymous profile
    (`apps/nfid-frontend/src/features/identitykit/service/method/interactive/icrc34-delegation-method.service.ts`)
  - ICRC-49 call canister with an anonymous profile
    (`.../icrc49-call-canister-method.service.ts`)
  - Legacy third-party auth (`packages/integration/src/lib/internet-identity/get-delegate.ts`)
- **Exit state:** for anchors >= 200 000 000 the delegation factory is asked for exactly the
  `maxTimeToLive` the caller passed (default stays 2 hours when the caller passes nothing).

## User Flow

1. User opens an IdentityKit dApp configured with `IdentityKitAuthType.DELEGATION`
   and connects NFID Wallet.
2. In the NFID popup the user selects "Use application-specific address" and clicks Connect.
3. NFID requests a canister-signed anonymous delegation with the dApp's `maxTimeToLive`
   (30 min for IdentityKit's default).
4. The dApp accepts the chain and the user is connected (today: rejected with the error above).

## Component States

_(No components in scope.)_

| State   | Trigger                                          | Behavior                                                                                   |
| ------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| success | Anchor >= 200M, caller passes `maxTimeToLive`    | `getDelegationChainSignedByCanister` receives that `maxTimeToLive` (ms).                   |
| success | Anchor >= 200M, caller passes no `maxTimeToLive` | Default `ONE_HOUR_IN_MS * 2` is forwarded (same lifetime as today).                        |
| success | Anchor < 200M                                    | Unchanged: lambda path `getAnonymousDelegationThroughLambda(..., maxTimeToLive, targets)`. |
| error   | Delegation factory rejects                       | Unchanged: error propagates to the caller.                                                 |

## Data & State Design

- No new data, no state changes. `maxTimeToLive` is already in milliseconds at this layer
  (ICRC-34 converts ns → ms before calling); `getDelegationChainSignedByCanister` converts
  ms → ns for `prepare_delegation`.

## Out of scope

- The internal wallet delegation cache in `delegation-i.ts` (~line 147) that also calls
  `getDelegationChainSignedByCanister` without a TTL: it is not returned to dApps and is
  cached for exactly 2 hours on purpose.
- Any change to the delegation factory canister.

## Acceptance Criteria

- [ ] For anchor >= 200 000 000, `getAnonymousDelegation(domain, sessionKey, identity, ttl, targets)`
      calls `getDelegationChainSignedByCanister(identity, targets, sessionKey, anchor, domain, ttl)`.
- [ ] Without an explicit `ttl`, the forwarded value is `ONE_HOUR_IN_MS * 2`.
- [ ] For anchor < 200 000 000 the lambda path is called exactly as before.
- [ ] New unit test covers the three cases above with all canister/lambda calls mocked.
- [ ] After deploy to dev: identitykit react-demo "Delegation login method with legacy_0
      profile" tests connect successfully (manual/e2e verification, not part of this PR's CI).
