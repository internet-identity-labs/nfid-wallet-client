# Command: security-review

Run a combined security + code-quality review of all changes on the current branch.
Produces two sections: confirmed vulnerabilities and actionable code improvements.

## Usage

```
/security-review
```

No arguments. Operates on the current branch diff against `main`.

---

## Steps

### 1. Collect branch diff

Run the following to gather context:

```
git diff main...HEAD --stat
git diff main...HEAD
git log main..HEAD --oneline
```

---

### 2. Spawn two review agents IN PARALLEL

Launch both agents at the same time so they run concurrently.

---

#### Agent A — Security

> You are a senior security engineer. Analyze the diff for HIGH-CONFIDENCE security vulnerabilities (>70% exploitability). Focus **only** on security issues **introduced by the new code** — do not report pre-existing issues.
>
> **Security categories to check:**
>
> | Category                | What to look for                                                                                                                |
> | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
> | EVM transaction signing | `transaction.to` passed to a signer without address validation; hardcoded chain IDs; `walletClient` configured with wrong chain |
> | ERC-20 approvals        | `approvalAddress` sourced from external API without whitelist check against known router constants                              |
> | Financial math          | `10 ** decimals` (use `BigNumber.pow` instead); integer overflow in amount calculations                                         |
> | API response trust      | Fields from external APIs (LiFi, AAVE, etc.) used directly in signing or fund transfer without validation                       |
> | Injection / XSS         | `dangerouslySetInnerHTML`, `eval`, `new Function(...)`, `innerHTML =` in new React code                                         |
> | Auth flows              | URL params or query strings interpolated into fetch URLs controlling host or protocol; JWT handling                             |
> | Secrets exposure        | API keys or private keys in new source files (not .env); console.log of sensitive values                                        |
> | ICP / canister          | Identity mismatches; using a stale identity after account switch                                                                |
>
> **Hard exclusions — do NOT report:**
>
> - DOS or resource exhaustion
> - Missing rate limiting
> - Theoretical race conditions (only report if a concrete funds-loss scenario exists)
> - Client-side permission checks (server is authoritative)
> - React XSS unless `dangerouslySetInnerHTML` or equivalent unsafe method is used
> - SSRF where only the path is controlled (not the host/protocol)
> - Secrets stored in .env files
> - Missing input validation without a proven exploitation path
>
> For each finding output: **file:line | severity (HIGH/MEDIUM) | category | description | exploit scenario | confidence (1–10)**. Only include findings with confidence ≥ 7.

---

#### Agent B — Code Quality

> You are a senior TypeScript/React engineer reviewing a PR for correctness and improvement opportunities. Analyze the diff and read any relevant source files needed to understand context.
>
> **What to look for:**
>
> | Category         | What to look for                                                                                                                                     |
> | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
> | Correctness bugs | Wrong conditions, off-by-one errors, missing null/undefined checks at real boundaries, stale closure values, incorrect async/await usage             |
> | React hooks      | Missing or incorrect `useEffect` dependency arrays; hooks called conditionally; stale state in event handlers                                        |
> | TypeScript       | `any` types that hide real type errors; unsafe `as` casts at non-boundary code; missing return types on exported functions                           |
> | State machines   | XState events sent to wrong states; missing guard conditions; context mutations outside `assign`                                                     |
> | Duplication      | Identical or near-identical logic blocks that could share a utility or base class (only flag if the duplication is non-trivial — 3+ lines, 2+ sites) |
> | Dead code        | Imports, variables, or parameters that are declared but never used                                                                                   |
> | Error handling   | Async calls with no catch that would silently swallow failures visible to the user; errors caught but not surfaced to UI state                       |
> | Performance      | Expensive computations inside render without `useMemo`; new object/array literals as default prop values causing re-renders                          |
>
> **Exclusions — do NOT report:**
>
> - Style or formatting issues (Prettier handles this)
> - Naming preferences
> - Missing comments or documentation
> - Suggestions to add tests (a separate command handles this)
> - Refactors that change behaviour, not just structure
> - Anything already flagged in the security pass
>
> For each finding output: **file:line | priority (P1/P2/P3) | category | what the problem is | suggested fix**
>
> Priority guide: P1 = likely causes a bug or data loss; P2 = degrades reliability or DX noticeably; P3 = cleanup with clear upside.
> Only include P1 and P2 unless P3 findings are very obvious and few.

---

### 3. Filter security findings

For **each security finding** from Agent A, spawn a separate Agent in parallel with:

> You are a security engineer filtering false positives. Read the relevant source file and evaluate this specific finding:
>
> `[paste the finding]`
>
> Answer:
>
> 1. Does the code actually contain the vulnerability as described? Quote the exact lines.
> 2. Is there any existing mitigation (validation, whitelist, framework protection) that makes this unexploitable?
> 3. Apply these precedents: (a) client-side JS/TS has no authorization obligation — server handles it; (b) React is safe against XSS unless `dangerouslySetInnerHTML` is used; (c) SSRF only matters if host/protocol is controlled; (d) environment variables are trusted.
>
> Output: **KEEP** or **DISCARD**, confidence score 1–10, and 2–3 sentences of reasoning.

Discard any security finding where the filter returned confidence < 8.

---

### 4. Output the combined report

---

# PR Review — `[branch-name]`

## Security Findings

> `[N]` candidates → `[M]` confirmed after filtering

### 🔴 Vuln N: [Category]: `file.ts:line`

- **Severity:** High / Medium
- **Confidence:** X/10
- **Description:** …
- **Exploit Scenario:** …
- **Recommendation:** …

_(If none: "No confirmed security vulnerabilities found.")_

---

## Code Quality

> `[N]` findings · `[P1 count]` P1 · `[P2 count]` P2 · `[P3 count]` P3

### 🔴 P1 — [Category]: `file.ts:line`

**Problem:** …
**Fix:** …

### 🟠 P2 — [Category]: `file.ts:line`

**Problem:** …
**Fix:** …

### 🔵 P3 — [Category]: `file.ts:line`

**Problem:** …
**Fix:** …

_(If none: "No code quality issues found.")_

---

## What this command covers (nfid-frontend context)

**Security surfaces:**

- Bridge / LiFi — API-supplied `to` and `approvalAddress` in EVM signing
- EVM services — per-chain `walletClient`; signer bypass paths
- AAVE / earn — supply/withdraw amounts from external responses
- WalletConnect — transaction forwarding from dApps to the signer
- Auth flows — token/IP approval endpoints accepting URL parameters
- Financial math — BigNumber precision across all token services

**Code quality focus:**

- XState machine correctness
- React hook dependency hygiene
- TypeScript `any` / unsafe cast elimination
- Async error surface in integration services
