# Plan: Align `.claude/` with current Claude Code best practices

> Status: PR OPEN — branch chore/sdd-workflow (PR #3297)
> Spec: none — tooling tier (only `.claude/` and `CLAUDE.md` change)
> Shortcut: —
> Created: 2026-11-13
> Branch: `chore/sdd-workflow` (added to the open PR #3297, engineer decision: one review)

## Goal

Bring the `.claude/` folder in line with the official Claude Code docs, so it uses one consistent
format, keeps supporting files with the skills that use them, enforces "ask before commit/push"
through Claude Code itself rather than memory, and keeps `CLAUDE.md` short and accurate. No app
code changes.

## Findings

Sources: https://code.claude.com/docs/en/skills, `/hooks`, `/settings`, `/memory`, `/permissions`,
`/sub-agents` (read 2026-11-13), and the repo.

| #   | Area                         | Now                                                                                                                                                                     | Docs say                                                                                                                                                                                                |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Skills vs commands           | 10 skills (`.claude/skills/<name>/SKILL.md`) + 4 commands (`.claude/commands/*.md`)                                                                                     | "Custom commands have been merged into skills… Your existing `.claude/commands/` files keep working." "Prefer a skill for new work, since skills also support supporting files."                        |
| A2  | Skill layout                 | Folders with `SKILL.md` (correct)                                                                                                                                       | A skill is `.claude/skills/<skill-name>/SKILL.md`; the folder holds supporting files ("reference.md", "scripts/…") that load only when needed                                                           |
| A3  | Frontmatter                  | Missing on `execute-ui-plan`, `ui-planning`, `ui-brainstorming`, `commit`, `security-review`, `write-unit-tests`                                                        | "All fields are optional. Only `description` is recommended so Claude knows when to use the skill."                                                                                                     |
| A4  | Supporting files             | `.claude/templates/{plan,spec,workflow}.md` and `.claude/scripts/{verify,e2e-local}.sh` live outside the skills                                                         | Supporting files live in the skill folder; `${CLAUDE_SKILL_DIR}` "is substituted in the skill's markdown content and Bash rules in `allowed-tools`"                                                     |
| A5  | Commit/push approval         | Only a rule in Claude's memory; Claude committed, pushed and opened PR #3297 without explicit approval                                                                  | "Rules are evaluated in order: deny, then ask, then allow… a matching ask rule still prompts even when the hook returned `allow`." Ask/deny apply to any subcommand of a compound command               |
| A6  | Hook commands                | Shell form + `rc=$?; [ $rc -eq 1 ] && exit 2` wrapper so a hook that can't load blocks                                                                                  | "Prefer exec form for any hook that references a path placeholder" (`command` + `args`); `onFailure: "block"` makes a hook that fails to start block (needs v2.1.295+; we're on 2.1.323)                |
| A7  | CLAUDE.md size/scope         | 157 lines; ~40 lines of frontend etiquette load in every session, including tooling work                                                                                | "target under 200 lines"; "If an entry… only matters for one part of the codebase, move it to a skill or a path-scoped rule" (`.claude/rules/*.md` with `paths:` frontmatter)                           |
| A8  | CLAUDE.md accuracy           | Lists `apps/nfid-wallet/` and `packages/integration-ethereum/` (neither exists; `apps/nfid-demo` is missing); "XState 4" (repo: 5.33.3); "Tailwind CSS 3" (repo: 4.3.5) | —                                                                                                                                                                                                       |
| A9  | "/verify in a fresh session" | Advice only                                                                                                                                                             | `context: fork` runs a skill as a subagent without history, but "runs in the background by default" with "the narrower tool set that applies to background subagents"; asking the user isn't documented |
| A10 | `plans/`, `specs/`           | Custom folders                                                                                                                                                          | Not covered by the docs; nothing to change                                                                                                                                                              |

## Modified / New Files

| File                                            | Phase | Change                                                                                     |
| ----------------------------------------------- | ----- | ------------------------------------------------------------------------------------------ |
| `.claude/commands/commit.md`                    | 1     | Removed (moved to `skills/commit/SKILL.md`)                                                |
| `.claude/commands/dependabot-update.md`         | 1     | Removed (moved to `skills/dependabot-update/SKILL.md`)                                     |
| `.claude/commands/security-review.md`           | 1     | Removed (moved to `skills/security-review/SKILL.md`)                                       |
| `.claude/commands/write-unit-tests.md`          | 1     | Removed (moved to `skills/write-unit-tests/SKILL.md`)                                      |
| `.claude/skills/commit/SKILL.md`                | 1     | New (moved); frontmatter added                                                             |
| `.claude/skills/dependabot-update/SKILL.md`     | 1, 2  | New (moved); keeps its frontmatter; points at `verify.sh`'s new path in a note             |
| `.claude/skills/security-review/SKILL.md`       | 1     | New (moved); frontmatter added                                                             |
| `.claude/skills/write-unit-tests/SKILL.md`      | 1     | New (moved); frontmatter added                                                             |
| `.claude/skills/execute-ui-plan/SKILL.md`       | 1     | Frontmatter added; link to `write-unit-tests` updated                                      |
| `.claude/skills/ui-planning/SKILL.md`           | 1     | Frontmatter added                                                                          |
| `.claude/skills/ui-brainstorming/SKILL.md`      | 1     | Frontmatter added                                                                          |
| `.claude/templates/plan.md`                     | 2     | Removed (moved to `skills/plan/template.md`)                                               |
| `.claude/templates/spec.md`                     | 2     | Removed (moved to `skills/spec/template.md`)                                               |
| `.claude/templates/workflow.md`                 | 2     | Removed (moved, see decision D1)                                                           |
| `.claude/skills/plan/template.md`               | 2     | New (moved)                                                                                |
| `.claude/skills/spec/template.md`               | 2     | New (moved)                                                                                |
| `.claude/sdd/workflow.md`                       | 2     | New (moved; decision D1)                                                                   |
| `.claude/scripts/verify.sh`                     | 2     | Removed (moved)                                                                            |
| `.claude/scripts/e2e-local.sh`                  | 2     | Removed (moved)                                                                            |
| `.claude/skills/verify/scripts/verify.sh`       | 2     | New (moved)                                                                                |
| `.claude/skills/verify/scripts/e2e-local.sh`    | 2     | New (moved)                                                                                |
| `.claude/skills/spec/SKILL.md`                  | 2     | Template and shared-rules paths updated                                                    |
| `.claude/skills/plan/SKILL.md`                  | 2     | Template and shared-rules paths updated                                                    |
| `.claude/skills/implement/SKILL.md`             | 1, 2  | Shared-rules path and `write-unit-tests`/`commit` references updated                       |
| `.claude/skills/implement-e2e/SKILL.md`         | 2     | Shared-rules and `e2e-local.sh` paths updated                                              |
| `.claude/skills/verify/SKILL.md`                | 2     | `${CLAUDE_SKILL_DIR}/scripts/…` paths; shared-rules path updated                           |
| `.claude/skills/document/SKILL.md`              | 2     | Shared-rules path and doc locations updated                                                |
| `.claude/skills/pr/SKILL.md`                    | 1, 2  | Shared-rules path, `commit` reference updated; explicit approval step before commit/push   |
| `.claude/settings.json`                         | 3     | Exec form + `onFailure: "block"` for both PreToolUse hooks; `ask` rules for commit/push/PR |
| `.claude/rules/frontend.md`                     | 4     | New: frontend code etiquette, path-scoped to `apps/**` and `packages/**`                   |
| `CLAUDE.md`                                     | 4     | Architecture Map facts fixed; etiquette moved out; SDD section shortened to pointers       |
| `.claude/plans/claude-folder-alignment.plan.md` | all   | This plan                                                                                  |
| `.claude/plans/sdd-workflow.plan.md`            | 5     | Dated note: moved files (Docs sync)                                                        |
| `.claude/plans/node-22-23-upgrade.plan.md`      | 5     | `dependabot-update` references point to the skill's new path and line numbers (Docs sync)  |

## E2E scope

- **None:** no app behaviour changes; the existing suite runs in CI on PR #3297.

## Implementation Checklist

### Phase 1 — Commands become skills; frontmatter everywhere

- [x] `git mv` each of the 4 commands to `.claude/skills/<same-name>/SKILL.md`, so the command
      names (`/commit`, `/dependabot-update`, `/security-review`, `/write-unit-tests`) don't change.
- [x] Add frontmatter (`name`, `description`, `argument-hint` where it takes arguments) to the 6
      files without it. `disable-model-invocation: true` for `commit` and `execute-ui-plan`
      (gates you run yourself); the others stay model-invocable, as today.
- [x] Update every reference to `.claude/commands/…` (skills, `CLAUDE.md`, shared rules).
- [x] Phase check: `grep -rn ".claude/commands" .claude CLAUDE.md` finds only historical plan
      notes; prettier clean.

### Phase 2 — Supporting files move into their skills

- [x] `git mv` `templates/plan.md` → `skills/plan/template.md`, `templates/spec.md` →
      `skills/spec/template.md`, `scripts/verify.sh` and `scripts/e2e-local.sh` →
      `skills/verify/scripts/`, `templates/workflow.md` → `.claude/sdd/workflow.md` (D1).
- [x] Skills reference their own files with relative links / `${CLAUDE_SKILL_DIR}`, and other
      skills' files with `${CLAUDE_PROJECT_DIR}/.claude/skills/…`.
- [x] `verify.sh`'s usage text and `e2e-local.sh`'s header updated for the new paths.
- [x] Phase check: `grep -rn "\.claude/templates\|\.claude/scripts" .claude CLAUDE.md` finds only
      historical notes; `bash -n` on both scripts; `verify.sh compare` still works on two
      throwaway result folders.

### Phase 3 — `settings.json`

- [x] Both PreToolUse hooks in exec form with `onFailure: "block"`:
      `{ "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/pre-tool-use.js"], "onFailure": "block" }`
      (same for `pre-bash.js`); PostToolUse hooks in exec form without `onFailure`.
- [x] `permissions.ask`: `Bash(git commit *)`, `Bash(git push *)`, `Bash(gh pr create *)`,
      `Bash(gh pr edit *)`, `Bash(gh pr comment *)`, `Bash(gh pr merge *)` (D2).
      Extended by verify finding C2: `Bash(git * commit *)`, `Bash(git * push *)`,
      `gh pr close|review|ready|reopen`.
- [x] Phase check: JSON valid; each hook still blocks or allows correctly when run the way the new
      config runs it. Live check by the engineer in a fresh session (Claude Code has to load the
      settings): a guarded edit is blocked, and `git commit --dry-run` asks.
  - 2026-11-13 automated part done: JSON valid; each hook run via `command` + `args` with
    `${CLAUDE_PROJECT_DIR}` substituted (no shell), as exec form does: Edit guard blocks an unplanned
    `apps/` file (exit 2) and allows a root file (0); Bash guard asks for `git reset --hard`, no prompt
    for `ls`; post-bash silent on a clean tree. **Live check accepted as skipped by the engineer (2026-11-13, findings C1/C8)** — was: the engineer's live check (fresh session:
    a guarded edit is blocked, `git commit --dry-run` asks; optionally rename a hook script to
    confirm `onFailure: "block"` blocks).

### Phase 4 — `CLAUDE.md` and rules

- [x] Move "Frontend Code Etiquette" to `.claude/rules/frontend.md` with
      `paths: ["apps/**", "packages/**"]` (the exact `paths` format is checked against the docs
      during implementation).
- [x] Fix the Architecture Map: apps are `nfid-frontend`, `nfid-demo`, `nfid-frontend-e2e`;
      packages are `client-db`, `config`, `constants`, `integration`, `swr`, `ui`,
      `ui-tailwind-core`, `utils`; XState 5; Tailwind CSS 4.
- [x] Shorten the SDD section to the tiers, the command list and a pointer to `.claude/sdd/workflow.md`.
- [x] Phase check: `CLAUDE.md` well under 200 lines; prettier clean.

### Phase 5 — Verify, document, PR (with approval)

- [x] `/implement-e2e` → `E2E N/A`. Done 2026-11-13.
- [x] `/verify`: review of this plan's diff (no build/test inputs change, so no full check suite);
      check that every moved file's references resolve.
- [x] `/document`: dated note in `sdd-workflow.plan.md` about the moved paths; memory updated.
- [ ] `/pr`: **show the staged file list, commit message and PR comment, and wait for explicit
      approval before `git commit` and `git push`.** Then push to `chore/sdd-workflow` (updates
      PR #3297) and comment on the PR with what changed.

## Decisions

Proposed, awaiting the engineer:

| #   | Question                                 | Recommendation                                                                                                                             |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Where do the shared pipeline rules live? | `.claude/sdd/workflow.md`: shared by 7 skills, so not inside one of them; not a `.claude/rules/` file, which would load into every session |
| D2  | Which actions get `ask` rules?           | Commit, push and PR create/edit/comment/merge. Leave the destructive-git checks in `pre-bash.js` (tested; handles `git -C`, `bash -c`, …)  |
| D3  | `context: fork` for `/verify` (A9)?      | Not now: background forks have a reduced tool set and may not be able to ask you questions. Follow-up                                      |
| D4  | Rename `security-review` (C7)?           | No, keep the name (engineer, 2026-11-13)                                                                                                   |
| D5  | Run the Phase 3 live check (C1, C8)?     | No, skipped and accepted (engineer, 2026-11-13). Fail-closed on a crashing guard relies on `onFailure: "block"` as documented, untested    |

## Risks

| Risk                                                         | Mitigation                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| A moved file is still referenced by its old path             | Phase checks grep for the old folders; `/verify` checks every reference resolves           |
| Exec form / `onFailure` behaves differently than documented  | Live check in a fresh session before the PR is updated; the old wrapper is easy to restore |
| `paths` frontmatter format wrong → frontend rules never load | Checked against the docs during Phase 4; the engineer confirms with `/memory` in a session |
| New skill names clash with built-ins                         | Names are unchanged from the commands they replace                                         |

## Follow-ups (not in this plan)

- `context: fork` for `/verify` (D3).
- Replace `pre-bash.js`'s git detection with `ask` permission rules if they prove enough.
- `/dependabot-update` uses `verify.sh` (existing follow-up from `sdd-workflow`).
- Live check of the hooks and `ask` rules in a fresh session, if anyone wants C1 proven: put a syntax
  error in `pre-tool-use.js` and try an edit; it should be blocked. If not, restore the `rc -eq 1`
  wrapper (works in exec form via `sh -c`).
- `permissions.ask` matches command text only: `gh api` writes and scripts that commit aren't
  covered (documented in `workflow.md` rule 3).

## Verify findings

### Run 2026-11-13 #1 — 8 findings (2 major, 6 minor), 1 candidate dismissed

Per the plan (Phase 5), no full check suite: the change has no build or test inputs (only
`.claude/` and `CLAUDE.md`). Checks run:

- every changed file is in the file table, and `.claude/commands/`, `/templates/` and `/scripts/` are gone
- 32 `.claude/…`, `${CLAUDE_SKILL_DIR}` and relative-link references in the live `.claude` docs,
  hooks and `CLAUDE.md` all resolve (the one hit, `.claude/worktrees/` in a hook comment, describes
  where agent worktrees live, not a file it uses)
- 14/14 skill frontmatters parse with a matching `name` and a `description`
- the rules `paths` parse; `settings.json` is valid
- hooks run in exec form behave correctly (the edit guard blocks `apps/`, the Bash guard asks for
  `git stash`)
- `CLAUDE.md` is 93 lines
- Prettier is clean

Also built-in `/code-review` (medium) on the working-tree diff.

- [x] C1 major (unverified) — accepted by engineer (2026-11-13: live check skipped) — Fail-closed may have regressed: `onFailure: "block"` replaced the
      `rc=$?; [ $rc -eq 1 ] && exit 2` wrapper. If a guard _starts_ and then exits 1 (syntax or import
      error before its own try/catch), does it still block? The hooks docs say exit 1 without JSON is
      "a non-blocking error unless the hook is one whose failure blocks the action", which suggests
      yes, but it isn't proven — `.claude/settings.json` — settle it in the **engineer's Phase 3
      live check**: temporarily put a syntax error in `pre-tool-use.js` and try an edit. If it isn't
      blocked, restore the wrapper (it works with exec form too:
      `"command": "sh", "args": ["-c", "node \"$CLAUDE_PROJECT_DIR/…\"; rc=$?; [ $rc -eq 1 ] && exit 2; exit $rc"]`).
- [x] C2 major — [fixed] added `Bash(git * commit *)`, `Bash(git * push *)`, `gh pr close|review|ready|reopen` to `permissions.ask`; `workflow.md` rule 3 lists exactly what prompts and says `gh api`/scripts aren't covered; `CLAUDE.md` and `/pr` point to that list instead of "always ask" — The `ask` rules miss common forms, yet `CLAUDE.md` and `workflow.md` say commit, push
      and PR actions "always ask": - git with global options: `git -C . commit`, `git -c k=v commit`, `git --no-pager push` - other PR mutations: `gh pr close`, `review`, `ready`, `reopen` - `gh api` writes

      Location: `.claude/settings.json` `permissions.ask`, plus the wording in `CLAUDE.md`/`workflow.md`.
      Fix: add `Bash(git * commit *)` and `Bash(git * push *)` (wildcards may sit anywhere), add
      `gh pr close|review|ready|reopen`, and soften the docs to "prompts for these commands" with
      the covered list.

- [x] C3 minor — [fixed] `workflow.md` hooks paragraph now describes `"onFailure": "block"` — `.claude/sdd/workflow.md` (hooks paragraph) still says a guard that can't load
      blocks because "its exit 1 is mapped to 2 in `settings.json`", which this diff removed —
      describe `onFailure: "block"` instead (and keep it consistent with C1's outcome).
- [x] C4 minor — [fixed] `/implement` and `/verify` now say to read `.claude/rules/frontend.md` — `/implement` ("Follow CLAUDE.md etiquette") and `/verify` (Etiquette check) still
      point at `CLAUDE.md`. The etiquette moved to the path-scoped `.claude/rules/frontend.md`, which
      only loads after a Read/Write/Edit of an `apps/`/`packages/` file; `/verify` may never
      trigger that — tell both skills to read `.claude/rules/frontend.md` explicitly.
- [x] C5 minor — [fixed] `rules/frontend.md` has a Unit tests section with the mock rule — `CLAUDE.md`'s shortened SDD section dropped "new unit tests mock canister and
      network calls", and `workflow.md` doesn't have it either (it's only in `/write-unit-tests`) —
      add it to `.claude/rules/frontend.md` (loads whenever a test under `apps/`/`packages/` is
      written or read).
- [x] C6 minor — [fixed] `disable-model-invocation: true` added — `/dependabot-update` is model-invocable (no `disable-model-invocation`) and
      pre-allows `Bash(git *)`, and its job is pushing commits to PR branches. As a command it was
      invocable the same way, but now's the moment — add `disable-model-invocation: true`.
- [x] C7 minor — accepted by engineer (2026-11-13: keep the name) — `security-review` shares its name with Claude Code's built-in `/security-review`.
      This isn't new (the command had the same name), but it's ambiguous which one runs — rename
      the project skill (e.g. `/nfid-security-review`) or accept. **Engineer decision.**
- [x] C8 minor (process) — accepted by engineer (2026-11-13: live check skipped) — Phase 3's live check is still open, and it's the only check that settles
      C1. `/verify` can't set `VERIFIED` until it's done.

Dismissed: "`${CLAUDE_PROJECT_DIR}` isn't substituted in skill markdown" — the skills docs say both
`${CLAUDE_SKILL_DIR}` and `${CLAUDE_PROJECT_DIR}` are substituted in the skill's markdown, and this
session's `/implement-e2e` invocation showed the substituted absolute path.

Not verifiable locally: the hooks' and permission rules' live behaviour (engineer's Phase 3 check);
full E2E in CI.

### Run 2026-11-13 #2 — 0 findings

Re-check after `/implement` fixed C2–C6 and the engineer accepted C1, C7 and C8. No full check suite
(no build or test inputs change). Checks run:

- every changed file is in the file table; the only listed file not changed yet is
  `sdd-workflow.plan.md` (Phase 5, `/document`); the old `commands/`, `templates/`, `scripts/` folders are gone
- 35 references resolve (the one hit is still the `.claude/worktrees/` hook comment)
- 14/14 skill frontmatters valid; `settings.json` valid, with 12 `ask` rules
- no stale wording left: "always ask", "exit 1 is mapped", "CLAUDE.md etiquette", the `rc -eq 1` wrapper
- `CLAUDE.md` is 94 lines; Prettier is clean
- review of the fix diff: no new problems. Note: `workflow.md` states that a crashing PreToolUse hook
  blocks, which is the behaviour C1 left unproven; covered by the engineer's acceptance of C1.

Not verifiable locally: the live behaviour of the hooks and `ask` rules (live check skipped, C1/C8
accepted); full E2E in CI.

## Docs sync

### 2026-11-13

Search terms: `.claude/commands/`, `.claude/templates/`, `.claude/scripts/`, `verify.sh`,
`e2e-local.sh`, `workflow.md`, `rules/frontend.md`, `permissions.ask`, `onFailure`, `rc -eq 1`,
"CLAUDE.md etiquette", "always ask", `security-review`, `dependabot-update`.

Updated:

- `.claude/plans/sdd-workflow.plan.md` — dated note on the moved paths, hook form and `ask` rules;
  its live follow-up now points to `.claude/skills/verify/scripts/verify.sh`. History left as written.
- `.claude/plans/node-22-23-upgrade.plan.md` (DRAFT, live) — `dependabot-update` references now
  `.claude/skills/dependabot-update/SKILL.md` L22/L64 (moved; frontmatter shifted the lines).
- This plan — file table, D4/D5, follow-ups, verify run #2.

Reviewed, no change needed: other plans (`COMPLETE` ones and `enable-email-device-removal` don't
reference the moved paths); `.claude/specs/**`; `CLAUDE.md`, `.claude/rules/frontend.md`,
`.claude/sdd/workflow.md`, all 14 `SKILL.md` files and supporting files (updated in Phases 1–4 and the
C2–C6 fixes; no stale wording); `.github/` (no references).

READMEs reviewed: root, `apps/nfid-frontend-e2e`, `docker-e2e-tests`, `packages/{client-db,config,integration,swr,ui,utils}` —
current (none mention `.claude/` or the pipeline).

## Deviations

Phase 1 (2026-11-13), within the planned files:

1. `dependabot-update` also got an explicit `name` (it already had a description), so all 14
   skills declare `name` + `description`.
2. Descriptions that contain `: ` are quoted: strict YAML rejects them unquoted (Claude Code's
   parser accepted them, but quoting doesn't depend on that). All 14 frontmatters parse with js-yaml.
3. `dependabot-update` pre-allows `Bash(git *)` via `allowed-tools`, which would cover
   `git push`. The Phase 3 `ask` rules are evaluated before allow rules, so they still prompt.
4. `node-22-23-upgrade.plan.md` (and historical notes in `sdd-workflow.plan.md`) still name
   `.claude/commands/dependabot-update.md`. Updating other plans is `/document`'s job (Phase 5).

Phase 2 (2026-11-13), within the planned files:

5. `verify.sh` and `e2e-local.sh` contain no `.claude` paths (`e2e-local.sh` wraps the repo's own
   `./scripts/run-e2e-frontend.sh`, which didn't move), so their usage text needed no change.
6. `/verify` references its scripts as `${CLAUDE_SKILL_DIR}/scripts/…`, `/implement-e2e` (another
   skill) as `${CLAUDE_PROJECT_DIR}/.claude/skills/verify/scripts/e2e-local.sh`, and the two
   templates are relative links (`[template.md](template.md)`), per the skills docs.
7. Phase check: `prettier --check .claude CLAUDE.md` also lists `specs/discovery/monetization.spec.md`
   and `specs/opencryptopay/opencryptopay.spec.md`, already unformatted on `main` (sdd-workflow
   Deviation 3); not touched here.

Phase 4 (2026-11-13), within the planned files:

8. `paths` format checked against the memory docs ("Accepts a YAML list or a comma-separated
   string", relative to the project root; a path-scoped rule "loads when Claude uses the Read,
   Write, or Edit tool on a matching file"). Used `"apps/**/*"` and `"packages/**/*"`.
9. `CLAUDE.md`: 157 → 93 lines. Architecture Map verified against the repo (`nfid-demo` is the demo
   dapp the E2E container builds; machines are in `features/`; `state/` holds auth state).
10. `.claude/sdd/workflow.md` rule 3 and `/pr` step 4 now spell out the approval step before
    commit/push (the `/pr` change was already in the file table's "Change" column for
    `pr/SKILL.md`, but had no checkbox; done here).
