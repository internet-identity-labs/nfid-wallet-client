---
name: plan
description: SDD step 2 of 7 — research the codebase and write an implementation plan to .claude/plans/<name>.plan.md. With no argument, list all plans and their status; "/plan <name> done" closes a merged plan.
argument-hint: "[<name> [sc-XXXX] | <name> done]"
disable-model-invocation: true
---

# /plan — write an implementation plan

Arguments: `$ARGUMENTS`

First read `.claude/sdd/workflow.md` and follow its rules.

## No argument: status overview

List every `.claude/plans/**/*.plan.md` as a table (plan, status, unchecked boxes, branch, PR) and
point out anything inconsistent, e.g. `COMPLETE` with unchecked boxes, or an editing status with no
recent changes. Then stop.

## `<name> done`

The plan must be `PR OPEN`. Find the PR by the plan's branch
(`gh pr list --head <branch> --state all --json number,state`); it must be `MERGED`. Then set
`> Status: DONE — merged <date> (#n)`. Otherwise refuse and say why. This is a local edit: say so,
and leave committing it to the engineer (e.g. with the next PR).

## `<name> [sc-XXXX]`: write the plan

### Preconditions

- **Pick the tier.** Will any file under `apps/` or `packages/` change?
  - Yes → feature tier: `.claude/specs/<name>.spec.md` must be `APPROVED`, otherwise refuse with
    `Run /spec <name> first`.
  - No → tooling tier: no spec; the header says `Spec: none — tooling tier (<why>)`.
- The plan exists and isn't `DRAFT` → refuse; offer to record a change under Deviations instead.

### Research (before writing anything)

- Read the spec. Find **every** file to change, and **every place the touched value, contract or
  behaviour is pinned or assumed**: code, tests, config, CI workflows, Docker, scripts, docs. Record
  them with evidence in `## Findings`.
- Check what's already there before adding anything new: `packages/ui` components, hooks,
  integration services, XState machines, E2E steps and page objects.
- For dependency or runtime changes: engines, peer ranges, release notes.
- Note anything that can't be verified locally (live canisters, secrets, CI-only jobs).

### Write

From this skill's [template.md](template.md):

- `Shortcut:` and `Branch:` come from the `sc-XXXX` argument if given (`feature/sc-XXXX-<name>`);
  otherwise `feature/<name>`, `fix/<name>` or `chore/<name>` by the type of work.
- The file table is complete, with **exact repo-relative paths only**: the guard hook uses it as
  the edit allow-list and ignores folders and globs. Include every new file (name it now), test,
  story and E2E file, and **every README the change makes stale** (search the READMEs of the touched
  apps and packages, the root README and `docker-e2e-tests/README.md`). READMEs are updated by
  `/implement` together with the code, never later.
- **E2E scope**: exactly one of new scenarios / existing scenarios affected / none (with reason).
- Phases are small, ordered and independently checkable; each ends with a Phase check. Unit tests
  belong to the phase that changes the code, and they mock canister and network calls.
- Decisions, risks and follow-ups are filled in. Questions you can't answer go to the engineer, not
  into guesses.

### Gate

Report the path, a 5–10 line summary, and the decisions you need from the engineer. Keep
`Status: DRAFT`. When the engineer says **approved**, set `> Status: APPROVED (<date>)` and end with
`Next: /implement <name>`.
