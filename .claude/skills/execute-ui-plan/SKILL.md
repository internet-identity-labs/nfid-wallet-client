# Skill: execute-ui-plan

## Purpose

Drive UI implementation one approved plan checkbox at a time, with automated verification between each step.

## Trigger

User invokes `/execute-ui-plan [feature-name]`.

## Pre-condition Check

1. Read `.claude/plans/[feature-name].plan.md`.
2. Verify the plan exists and does NOT contain `Status: DRAFT`.
3. Verify `.claude/specs/[feature-name].spec.md` exists and is approved.
4. If either is missing or still DRAFT, halt and respond:
   > "Cannot execute: plan or spec is missing / not approved for `[feature-name]`."
5. If the plan has a `> Branch:` line and you're not on that branch: create it from `origin/main`
   (`git switch -c <branch> origin/main`) or switch to it if it exists and the tree is clean.
   Older plans without a Branch line only grant edits while `IN PROGRESS`, on any branch.
6. Set the plan's `> Status:` line to `IN PROGRESS`. The SDD guard hook only allows edits under
   `apps/` and `packages/` while a plan is in an editing status, belongs to the current branch,
   and lists the file's exact path in the first column of its **New Files** / **Modified Files**
   tables.

## Execution Loop

### For each iteration:

**1. Find next unchecked checkbox**
Scan the Implementation Checklist for the first `- [ ]` item.
If none remain, go to **Completion**.

**2. Announce**
Tell the engineer:

> "Executing: `[checkbox text]`"

**3. Write tests first (TDD)**

- For any new component: write a `*.spec.tsx` test file before the component
- For any new hook/service: write a `*.spec.ts` test file before the implementation
- Tests must cover: renders correctly, loading state, error state, happy path interaction

**4. Implement**
Write or modify exactly the files named in that checkbox.

Rules during implementation:

- No `any` types — use `unknown` + narrowing if type is unclear
- Tailwind classes only for styling — no inline `style={{}}`
- All new interactive elements need `aria-label` or visible accessible text
- Import order must follow Prettier config: third-party → @nfid* → frontend/* → ./local
- XState machines use typed events — check with `npx tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json` before finalizing

**5. Mark checkbox complete**
Update the plan file: change `- [ ]` to `- [x]` for the completed item.

**6. Run verification gate**
After each checkbox, run:

```
yarn nx lint nfid-wallet-client
```

(Use the Nx project that owns the changed files: `nfid-wallet-client` for `apps/nfid-frontend`,
`ui` for `packages/ui`, and so on.)

No `--fix`: the post-edit hook already runs `eslint --fix` and Prettier on every file you edit,
and a project-wide `--fix` would rewrite files outside the plan (the Bash guard asks before it, and
the post-bash check reports the result). Fix any errors that remain with the Edit tool before
continuing.

**7. After every 3 checkboxes OR after any state/type change, also run:**

```
yarn nx test nfid-wallet-client --testPathPatterns=[relevant-file]
```

If tests fail, fix before proceeding to the next checkbox.

**8. Report status**
Tell the engineer:

> "✓ Done: `[checkbox text]`
> Lint: [passed / fixed N issues]
> Tests: [passed / skipped]
> Next: `[next checkbox text]` — proceed? (y/n)"

Wait for confirmation before the next checkbox **if the completed step was a data layer or state machine change**. For atomic UI-only steps, proceed automatically unless the engineer said to pause.

---

## Completion

When all checkboxes are marked `[x]`:

1. Run full verification suite:
   ```
   yarn nx lint nfid-wallet-client
   yarn nx test nfid-wallet-client
   npx tsc --noEmit -p apps/nfid-frontend/tsconfig.app.json
   npx tsc --noEmit -p apps/nfid-frontend/tsconfig.spec.json
   ```
2. Update plan status to `Status: COMPLETE`.
3. Report:
   > "Plan `[feature-name]` complete. All checkboxes done, lint clean, tests passing.
   > Spec: `.claude/specs/[feature-name].spec.md`
   > Plan: `.claude/plans/[feature-name].plan.md`
   > Ready for PR."

---

## Abort Conditions

- If a file outside the plan's **New Files** / **Modified Files** tables needs to change, STOP and ask:
  > "This change requires modifying `[file]` which is not in the plan. Should I update the plan first?"
- Never delete files not listed in the plan.
- Never modify files in `apps/nfid-frontend/src/integration/_ic_api/` (auto-generated).
