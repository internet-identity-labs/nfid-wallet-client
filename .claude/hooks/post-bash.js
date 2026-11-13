#!/usr/bin/env node
/**
 * PostToolUse check for Bash — the backstop behind pre-bash.js.
 *
 * pre-bash.js guesses from the command text whether a command will write under
 * apps/ or packages/; shell syntax always has another way to write a file, so
 * that can't be complete. This hook looks at the result instead. After every
 * shell command it runs `git status` on apps/ and packages/ of the checkout the
 * shell is in (and of this project), if they use this workflow, and reports every
 * changed file that no plan on this branch lists: exact path in the first column
 * of the file table, any status except DONE/COMPLETE (the Edit guard also
 * requires an editing status; a planned change stays planned after VERIFIED).
 * Plans without a Branch line count only while IN PROGRESS, as for edits.
 * _ic_api/ changes are always reported.
 *
 * Each unplanned file is reported once **per session**: the files each session has
 * already been told about are kept in the checkout's git dir
 * (sdd-unplanned-changes.json, a map session_id → files, last few sessions,
 * written atomically). So a new session (e.g. the fresh one recommended for
 * /verify) hears about leftovers again, two sessions open side by side don't
 * reset each other, and a file that stops being unplanned and comes back is
 * reported again. Checkouts on a detached HEAD (e.g. /verify's re-check
 * worktree) are skipped: with no branch, no plan can apply there.
 *
 * It detects; it can't undo. The report goes to Claude (decision "block", so it
 * must react before continuing) and to the engineer (systemMessage).
 *
 * Input: JSON on stdin ({ tool_name: "Bash", cwd, tool_input: { command } }).
 * Output: nothing, or a JSON report on stdout. Always exits 0.
 */

import { execFileSync } from "child_process"
import { readFileSync, renameSync, writeFileSync } from "fs"
import { resolve } from "path"

import {
  canonical,
  checkoutRoot,
  currentBranch,
  hookRoot,
  isGuarded,
  listsFile,
  plansFor,
  readInput,
  usesWorkflow,
} from "./pre-tool-use.js"

const STATE_FILE = "sdd-unplanned-changes.json"
const KEEP_SESSIONS = 5

const git = (root, args) =>
  execFileSync("git", ["-C", root, ...args], {
    stdio: ["ignore", "pipe", "ignore"],
  }).toString()

// Changed, added, deleted and untracked paths under apps/ and packages/.
function changedPaths(root) {
  const out = git(root, [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
    "--",
    "apps",
    "packages",
  ])
  const entries = out.split("\0").filter(Boolean)
  const paths = []
  for (let i = 0; i < entries.length; i++) {
    const status = entries[i].slice(0, 2)
    paths.push(entries[i].slice(3))
    // A rename/copy entry is followed by its source path, which changed too.
    if (status[0] === "R" || status[0] === "C") paths.push(entries[++i])
  }
  return [...new Set(paths)].filter(isGuarded)
}

// Planned = listed (exact path, first table column) by a plan on this branch that
// isn't finished (DONE/COMPLETE), whatever its status, so VERIFIED/DOCUMENTED/PR
// OPEN work and DRAFT deviations aren't reported. Branchless plans count only
// while IN PROGRESS. Edit permission (editing statuses) is pre-tool-use.js's job.
function unplannedIn(root) {
  const { onBranch } = plansFor(root)
  return changedPaths(root).filter(
    (rel) =>
      rel.includes("/_ic_api/") ||
      !onBranch.some((p) => listsFile(p.content, rel)),
  )
}

// { session_id: [files already reported to that session] }, oldest first.
function readState(path) {
  try {
    const state = JSON.parse(readFileSync(path, "utf8"))
    return state && typeof state.sessions === "object" ? state.sessions : {}
  } catch {
    return {}
  }
}

// Atomic: write a temp file, then rename, so a parallel hook never reads a
// half-written file.
function writeState(path, sessions) {
  const ids = Object.keys(sessions)
  const kept = Object.fromEntries(
    ids.slice(-KEEP_SESSIONS).map((id) => [id, sessions[id]]),
  )
  const tmp = `${path}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify({ sessions: kept }))
  renameSync(tmp, path)
}

function checkoutsFor(cwd) {
  const roots = [checkoutRoot(canonical(cwd)), hookRoot()].filter(
    (root) => root && usesWorkflow(root) && currentBranch(root),
  )
  return [...new Set(roots)]
}

function main(input) {
  const command = String(input.tool_input?.command ?? "")
  const findings = []
  for (const root of checkoutsFor(input.cwd || process.cwd())) {
    const unplanned = unplannedIn(root)
    const statePath = resolve(
      root,
      git(root, ["rev-parse", "--git-path", STATE_FILE]).trim(),
    )
    const session = String(input.session_id ?? "")
    const sessions = readState(statePath)
    const reported = new Set(sessions[session] ?? [])
    const fresh = unplanned.filter((rel) => !reported.has(rel))
    delete sessions[session] // re-insert last, so it counts as the newest
    sessions[session] = unplanned
    writeState(statePath, sessions)
    if (fresh.length) findings.push({ root, fresh })
  }
  if (!findings.length) return

  const list = findings
    .flatMap(({ root, fresh }) => fresh.map((rel) => `  - ${rel}  (${root})`))
    .join("\n")
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason:
        `[SDD Guard] After this shell command, these files under apps/ or packages/ are changed ` +
        `but no plan on this branch lists them:\n${list}\n\nCommand: ${command}\n\n` +
        `Stop and tell the engineer. If the change was unintended, ask before reverting it. ` +
        `If it's needed, record a deviation (exact path in the file table, Status: DRAFT) and ` +
        `wait for approval.`,
      systemMessage: `[SDD Guard] Unplanned changes under apps/ or packages/ after a shell command:\n${list}`,
    }),
  )
}

try {
  const input = readInput()
  if (input?.tool_name === "Bash") main(input)
} catch (error) {
  process.stdout.write(
    JSON.stringify({
      systemMessage: `[SDD Guard] post-bash check failed, so unplanned changes weren't checked: ${error?.message ?? error}`,
    }),
  )
}
process.exit(0)
