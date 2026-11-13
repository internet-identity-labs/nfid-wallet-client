---
name: verify
description: SDD step 5 of 7 — findings only. Checks the branch against a main baseline (install, tsc, lint, unit, build), runs the feature's E2E tags locally, reviews conformance with the spec/plan and the diff. Never edits code or tests.
argument-hint: "<name>"
disable-model-invocation: true
---

# /verify — find problems, don't fix them

Arguments: `$ARGUMENTS` → `<name>`.

First read `.claude/sdd/workflow.md` and follow its rules.

**Best run in a fresh session:** review the plan and the diff, not the memory of writing them.

## Hard rule

`/verify` **never edits code, tests, config or docs**. The only file it writes is the plan
(`## Verify findings` and the Status line). Every problem becomes a finding, and the engineer runs
`/implement <name>` to fix it.

## Preconditions

- The status must be `E2E READY` or `E2E N/A`. Otherwise refuse.
- You must be on the plan's branch, and the working tree must contain the work (uncommitted is expected).

## Steps

### 1. Automated checks vs a `main` baseline

1. Baseline: `dir=$(${CLAUDE_SKILL_DIR}/scripts/verify.sh baseline-dir)`. It fetches `origin/main` first, so
   the baseline is the current `main`. If `$dir/status` doesn't end with `done`:
   - `git worktree add <repo>/../nfid-verify-base origin/main`
   - `${CLAUDE_SKILL_DIR}/scripts/verify.sh run <that worktree> "$dir"`
   - `git worktree remove` it afterwards

   The cache is keyed by the `main` SHA, so later runs reuse it.

2. Branch: `${CLAUDE_SKILL_DIR}/scripts/verify.sh run <repo> <scratchpad>/verify-<name>`. It installs with
   `--frozen-lockfile`, so it never changes `yarn.lock`; a lockfile that needs updating fails the
   install stage, and that's a finding. Tell the engineer
   it takes about 15 minutes, and run it in the background.
3. `${CLAUDE_SKILL_DIR}/scripts/verify.sh compare "$dir" <scratchpad>/verify-<name>`.
4. **For every new failing unit test, re-run that file once**
   (`npx env-cmd -f .env.test yarn nx test <project> --testPathPatterns=<file> --runInBand`):
   - passes now → flaky, noted but not a finding
   - fails again → finding
   - it calls live canisters and `LAMBDA_IDENTITY` is unset → "can't verify locally", not a finding
5. **For every other new failure** (a stage such as build or lint, or new error lines), check
   whether it comes from the branch or from the local environment:
   - re-run that stage once on the branch
   - still failing, and the diff has inputs to that stage (source, config, dependencies) → finding
   - still failing, but the diff has **no** inputs to it (e.g. only `.claude/` or docs changed), or
     the error points into `node_modules` → re-check in a fresh worktree of the branch with a
     `--frozen-lockfile` install. Start it at the branch's current commit, so commits already on
     the branch (fix loop) are included, then copy only the uncommitted work, binaries included:
     - `git worktree add --detach <repo>/../nfid-verify-recheck HEAD`
     - `git diff --binary HEAD | git -C <repo>/../nfid-verify-recheck apply --binary --allow-empty`
       (`--allow-empty`: there may be no tracked changes, only untracked files)
     - untracked files: `git ls-files --others --exclude-standard -z | tar --null -T - -cf - | tar -xf - -C <repo>/../nfid-verify-recheck`
     - `yarn install --frozen-lockfile` there, re-run the stage, then
       `git worktree remove --force <repo>/../nfid-verify-recheck`. `--force` is needed because the
       copy is dirty by design; it only removes /verify's own throwaway checkout, never your work.

     Then:
     - passes there → environmental (the checkout's `node_modules`); report it with the fix
       (`rm -rf node_modules && yarn install --frozen-lockfile`), not a finding
     - fails there too → finding

### 2. Local E2E for this feature

- E2E scope "None" (`E2E N/A`) → skip and say so in the report.
- Otherwise: `${CLAUDE_SKILL_DIR}/scripts/e2e-local.sh '<tags from the plan>' <scratchpad>/e2e-<name>`.
- A failing scenario → re-run once. If it still fails, check it against `main`. Step 1 has already
  removed its baseline worktree (or never created one, on a cache hit), so:
  - create one: `git worktree add <repo>/../nfid-verify-e2e origin/main`, then
    `yarn install --frozen-lockfile` in it
  - run the same tags from there:
    `(cd <repo>/../nfid-verify-e2e && ${CLAUDE_SKILL_DIR}/scripts/e2e-local.sh '<tags>' <scratchpad>/e2e-<name>-main)`.
    The script uses the checkout it's run from.
  - `git worktree remove <repo>/../nfid-verify-e2e` afterwards

  Then:
  - fails there too → environmental (dev canisters, accounts); report it, not a finding
  - passes there → finding

### 3. Review

- **Conformance:**
  - feature tier: each numbered requirement in the spec is implemented (point to the code)
  - every plan checkbox is really done
  - nothing out of scope was added
- **Files:** `git status --short` + `git diff --stat origin/main`, untracked files included. Every
  changed file must be in the plan's file table, and every listed file must be changed or explained.
- **Code review:** run the built-in `/code-review` on the working-tree diff. Keep findings that
  survive your own check.
- **Etiquette** (read `.claude/rules/frontend.md`; it only auto-loads once an `apps/`/`packages/`
  file is read):
  - no `any`; no inline styles; Tailwind tokens; a11y labels
  - import order
  - new unit tests mock canister and network calls
  - no `console.log`, `TODO` or dead code left behind

### 4. Record and set status

Write `## Verify findings` in the plan:

```
### Run <date> — <n> findings
- [ ] F1 <severity: blocker|major|minor> — <what is wrong> — <evidence: file:line / test name / log line> — <suggested fix>
…
Not verifiable locally: <full E2E + mobile → CI; live-canister tests without LAMBDA_IDENTITY; …>
Flaky (re-run passed): <tests>
Environmental (also fails on main): <tests/scenarios>
```

- Any open blocker/major finding → `IN PROGRESS — <n> verify findings`. Next: `/implement <name>`.
- Only minor findings → ask the engineer whether to fix them now (`/implement`) or accept them (they
  stay listed, marked `accepted by engineer`).
- No findings → `VERIFIED`. Next: `/document <name>`.

Report the counts, the findings, and the not-verifiable list. Don't soften findings and don't fix
them.
