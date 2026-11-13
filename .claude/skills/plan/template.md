# Plan: <Title>

> Status: DRAFT — awaiting engineer approval
> Spec: .claude/specs/<name>.spec.md <!-- tooling tier: "none — tooling tier (<why>)" -->
> Shortcut: sc-XXXX <!-- or "—" -->
> Created: <YYYY-MM-DD>
> Branch: `feature/sc-XXXX-<name>` <!-- no story: feature/<name>, fix/<name> or chore/<name> -->

## Goal

<One paragraph: what changes and why. Link the spec for feature work.>

## Findings

<What the research found: current behaviour, every place the touched value or contract is pinned or
assumed (code, config, CI, Docker, docs), and constraints such as engines, peers or canister APIs.
Use a table with evidence (file:line, command output).>

## Modified / New Files

<!-- This table is the guard's allow-list for apps/ and packages/, on the branch in the header.
     Only exact repo-relative paths in backticks in the FIRST column count; folders, globs and
     paths mentioned in the Change column grant nothing.
     List every file: new files, tests, stories, E2E files and the READMEs the change makes stale.
     A file nobody foresaw goes through the deviation flow.
     (Backticked text inside this comment is ignored by the guard.) -->

| File                         | Phase | Change |
| ---------------------------- | ----- | ------ |
| `apps/nfid-frontend/src/<…>` | 1     | …      |

## E2E scope

<!-- Pick exactly one. /implement-e2e and /verify read this section. -->

- **New scenarios:** `<Feature>.feature` — scenarios …; tags `@<area>`; accounts from `users.json`: …
- **Existing scenarios affected:** tags `@<area>`; why …
- **None:** <reason, e.g. no user-visible behaviour change; the existing suite runs in CI>

## Implementation Checklist

<!-- /implement runs one phase per call. Every phase ends with its own check. -->

### Phase 1 — <name>

- [ ] <task> (`path/to/file.ts`)
- [ ] Unit tests: <what>, canister/network calls mocked
- [ ] Phase check: `yarn nx lint <project>`, `npx tsc --noEmit -p <tsconfig>`,
      `yarn nx test <project> --testPathPatterns=<files>`

### Phase 2 — <name>

- [ ] …
- [ ] Phase check: …

## Decisions

| Question | Decision | Why |
| -------- | -------- | --- |

## Risks

| Risk | Mitigation |
| ---- | ---------- |

## Follow-ups (not in this plan)

-

## Verify findings

<!-- Written by /verify. /implement fixes open findings before any new phase. -->

None yet.

## Docs sync

<!-- Written by /document. -->

Not run yet.

## Deviations

<!-- Anything that differs from the approved plan. An out-of-plan file sets Status back to DRAFT. -->

None yet.
