# Spec: <Feature Name>

> Status: DRAFT — awaiting engineer approval
> Shortcut: sc-XXXX <!-- or "—" -->
> Created: <YYYY-MM-DD>

## Overview

<One paragraph: the user-facing purpose and why now.>

## Scope

- App/area: <`apps/nfid-frontend` feature dir, package, …>
- Entry point: <route, button, deeplink, wallet event, …>
- Exit state: <what the user sees when it worked>

## Requirements

<!-- Numbered, so /verify and /document can check each one. -->

1. …
2. …

## User Flow

1. …

## Data & State

- Fetch: <SWR hook / integration service / canister method>
- Mutations and side effects: <canister call, chain tx, storage write>
- New state: <XState machine / Jotai atom / context / none>

## UI (only if the feature has UI)

| State   | Trigger | UI behaviour |
| ------- | ------- | ------------ |
| loading | …       | …            |
| empty   | …       | …            |
| error   | …       | …            |
| success | …       | …            |

- Accessibility: focus trap (modals), aria-labels, keyboard navigation, WCAG AA contrast
- Responsive: mobile … / desktop …

## E2E expectations

<Which user journeys must be covered end to end, or "none" with the reason.>

## Edge Cases

- …

## Out of Scope

- …
