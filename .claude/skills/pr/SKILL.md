---
name: pr
description: SDD step 7 of 7 — create the commit, push the branch and open (or update) the pull request for a documented plan. Never merges, never force-pushes.
argument-hint: "<name>"
disable-model-invocation: true
---

# /pr — commit, push, open the PR

Arguments: `$ARGUMENTS` → `<name>`.

First read `.claude/templates/workflow.md` and follow its rules.

## Preconditions

- The status must be `DOCUMENTED`. Otherwise refuse.
- You must be on the plan's branch, never `main`.
- `gh auth status` must succeed.

## 1. Commit (rules from `.claude/commands/commit.md`)

0. Set `> Status: PR OPEN — branch <branch>` in the plan **before** committing, so the commit
   already carries the final status. The PR number isn't known yet; `/plan <name> done` finds the
   PR by branch.
1. `git status --short` and `git diff origin/main`. Scan the changed files for leftovers:
   `console.log`/`debug`, `TODO`/`FIXME`, commented-out code, `.env*` files, generated files. If you
   find any, **stop**: it's a finding for `/implement`, not something to fix here.
2. **Stage explicitly:** the files in the plan's file table plus the plan and spec. Never
   `git add -A` / `git add .`. Changed files that aren't in the table → stop and ask.
3. **Message:** Conventional Commits, first line under 72 characters, a `[sc-XXXX]` suffix if the
   plan has a Shortcut ID, e.g. `feat: add ICRC-7 marketplace filters [sc-19901]`. The body is a
   short summary from the plan's Goal and phases, plus the attribution line from the current
   session's instructions.
4. `git commit`. Husky runs lint-staged; let it, and never use `--no-verify`. If the hook fails,
   stop and report it as a finding for `/implement`.

## 2. Push

`git push -u origin <branch>`. Never `--force` or `--force-with-lease`. A rejected push → stop and
report it; don't rebase.

## 3. Open or update the PR

- **No PR for the branch yet** (`gh pr list --head <branch>`): `gh pr create --base main` with:
  - Title: the commit's first line.
  - Body:

    ```
    ## Summary
    <2–4 lines from the plan's Goal>

    ## Changes
    <phases → bullet list of what changed>

    ## Verification
    <from ## Verify findings: checks run vs main, local E2E tags + result, review result>

    ## Not verified locally
    <full E2E + mobile → CI; live-canister tests; anything else>

    Plan: `.claude/plans/<name>.plan.md`  ·  Spec: `<spec path or "none (tooling tier)">`
    Shortcut: <link or "—">

    <attribution footer from the current session's instructions>
    ```

- **PR already open** (fix loop): push the new commit, then `gh pr comment` with what changed and
  which finding or review comment it fixes.

## 4. Finish

- Don't make another commit just to record the PR number; the status already says `PR OPEN`.
- Report the PR URL, the commit SHA, and that CI's Desktop Tests (unit + E2E desktop/mobile) are
  now running. If CI fails or reviewers ask for changes: `/implement <name>` → `/verify` →
  `/document` → `/pr`.

## Never

Merge, approve, close or force-push. Push to `main`. Skip hooks.
