---
name: implement
description: SDD step 3 of 7 — implement the next phase of an approved plan (code + unit tests), or fix open /verify findings. One phase per call; never commits.
argument-hint: "<name> [--step]"
disable-model-invocation: true
---

# /implement — code + unit tests, one phase per call

Arguments: `$ARGUMENTS` → `<name>`, optional `--step` (one checkbox, then stop).

First read `.claude/templates/workflow.md` and follow its rules.

## Preconditions

- The status must be `APPROVED`, `IN PROGRESS`, or `PR OPEN` (fix loop: CI red or review
  comments; collect them with `gh pr checks` / `gh pr view --comments` first). Otherwise refuse.
- Feature tier: the spec must be `APPROVED`.
- The working tree must not contain changes to files outside this plan's file table (other than
  the plan/spec). If it does, stop and ask; they may belong to other work.

## Steps

1. **Branch.** If the current branch isn't the plan's `Branch:`:
   - it doesn't exist → `git fetch origin && git switch -c <branch> origin/main`
   - it exists → `git switch <branch>`, only if the working tree is clean

   No commit.

2. **Status** → `IN PROGRESS — Phase <n>` (or `— fixing verify findings`). The guard hook needs this
   before any edit under `apps/` or `packages/`.
3. **Pick the work:**
   - Open items in `## Verify findings` (or PR review/CI failures in the fix loop) come first.
     Treat each as a task and mark it `[fixed]` with a one-line note when done.
   - Otherwise, the first phase with unchecked boxes. With `--step`, only its first unchecked box.
4. **For each checkbox:**
   - Unit tests first, following `.claude/commands/write-unit-tests.md`. New tests **mock canister
     and network calls**; no live dev canisters.
   - Change only the files the plan lists. Follow CLAUDE.md etiquette: no `any`, Tailwind only,
     a11y labels, import order.
   - **Update the READMEs** (and other docs next to the code) that describe what you changed, in the
     same checkbox, so the docs are current as soon as the code is. A stale README that isn't in
     the plan → deviation flow.
   - Tick the box (`- [x]`) as soon as it's done, not in bulk at the end.
   - A file outside the plan is needed → deviation flow (workflow.md rule 6). Stop.
5. **Phase check:** run the phase's own check: lint and tsc for the touched projects, and
   `yarn nx test <project> --testPathPatterns=<changed specs>`. Fix what this phase broke. A failure
   that also happens on `origin/main` isn't yours: note it, don't fix it.
6. **Status:**
   - phases left or findings still open → `IN PROGRESS — Phase <n+1> next`
   - everything done → `IMPLEMENTED`
7. **Report:** files changed (`git status --short`), boxes ticked, phase check results, anything
   surprising, and the next command: `/implement <name>` or `/implement-e2e <name>`.

## Never

- Commit, push, or create a PR.
- Edit files outside the plan or under `_ic_api/`.
- Mark a box done that isn't, or skip the phase check.
