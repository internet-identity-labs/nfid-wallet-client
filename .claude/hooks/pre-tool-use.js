#!/usr/bin/env node
/**
 * PreToolUse guard — SDD enforcement.
 *
 * Blocks Write/Edit/MultiEdit/NotebookEdit on files under apps/ or packages/ of
 * the git checkout the file belongs to, unless a plan in that same checkout's
 * .claude/plans/ (searched recursively):
 *   1. has an editing status on its "> Status:" line
 *      (IN PROGRESS, IMPLEMENTED, E2E READY, E2E N/A),
 *   2. belongs to that checkout's branch: its "> Branch:" line names it (several
 *      backticked branches are allowed). Plans without a Branch line (older flow)
 *      count only while IN PROGRESS, so a stalled plan can't unlock files forever.
 *   3. lists the target file's exact repo-relative path, in backticks, in a file
 *      table: a "## Modified / New Files", "## New Files" or "## Modified Files"
 *      section. Folders and globs grant nothing (engineer decision T5); HTML
 *      comments, fenced code blocks and every other section of the plan are ignored.
 *
 * Worktrees (e.g. agent isolation under .claude/worktrees/) are guarded, not
 * exempt: plans stay uncommitted until /pr, so a worktree normally has no active
 * plan of its own and guarded edits there are blocked.
 *
 * Generated Candid bindings (any path containing /_ic_api/) are always blocked.
 *
 * The plan's spec approval is enforced by /plan and /implement, not here.
 * This is a guardrail against *accidental* out-of-plan edits, not a security
 * boundary: plans are plain files, and approval is a human step in the workflow.
 * Shell commands are covered separately by pre-bash.js.
 *
 * Input: JSON on stdin ({ tool_name, tool_input }).
 * Exit 0 = allow. Exit 2 = block (stderr is shown to Claude). Any other exit
 * code is a non-blocking error in Claude Code, so this hook never exits 1:
 * unreadable input and every unexpected error block (exit 2) instead of
 * silently allowing the edit.
 */

// Also a module: post-tool-use.js, pre-bash.js and post-bash.js import the
// path and plan helpers below (exported), so all hooks apply the same rules.
// The guard itself only runs when this file is executed as the hook.

import { execFileSync } from "child_process"
import { existsSync, readFileSync, readdirSync, realpathSync } from "fs"
import { basename, dirname, join, relative, resolve } from "path"
import { fileURLToPath } from "url"

export const GUARDED_PREFIXES = ["apps/", "packages/"]
export const WRITE_TOOLS = ["Write", "Edit", "MultiEdit", "NotebookEdit"]
// VERIFIED is deliberately absent: after /verify only docs under .claude/ and
// CLAUDE.md change (/document), and those aren't guarded.
const EDITING_STATUSES = ["IN PROGRESS", "IMPLEMENTED", "E2E READY", "E2E N/A"]
const FILE_TABLE_HEADING =
  /^## (Modified \/ New Files|New Files|Modified Files)\s*$/

// Canonical on-disk path. macOS volumes are case-insensitive, so the same file
// can arrive as /Users/x/Documents/… or /users/x/documents/…; without this,
// relative() returns "../…" and a guarded file would slip through unchecked.
// Files that don't exist yet (Write) resolve through their nearest existing parent.
export function canonical(path) {
  const abs = resolve(path)
  if (existsSync(abs)) return realpathSync.native(abs)
  const parent = dirname(abs)
  return parent === abs ? abs : join(canonical(parent), basename(abs))
}

// Hook input from stdin. Throws on empty or invalid input: missing input is
// unexpected, and each hook decides what failing safe means for it.
export function readInput() {
  const raw = readFileSync(0, "utf8")
  if (!raw.trim()) throw new Error("empty hook input on stdin")
  return JSON.parse(raw)
}

// Root of the git checkout that contains `path`: the nearest ancestor with a
// `.git` entry (a directory in the main checkout, a file in a worktree).
export function checkoutRoot(path) {
  let dir = path
  for (;;) {
    if (existsSync(join(dir, ".git"))) return dir
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

// symbolic-ref also works on a branch with no commits yet (rev-parse fails
// there); it fails on a detached HEAD, which has no branch → null.
export function currentBranch(repoRoot) {
  try {
    const branch = execFileSync(
      "git",
      ["symbolic-ref", "--short", "-q", "HEAD"],
      {
        cwd: repoRoot,
        stdio: ["ignore", "pipe", "ignore"],
      },
    )
      .toString()
      .trim()
    return branch || null
  } catch {
    return null
  }
}

// HTML comments and fenced code blocks (also indented ones inside list items)
// hold guidance and examples, never grants.
function withoutCommentsAndFences(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[ \t]*```[^\n]*\n[\s\S]*?^[ \t]*```[^\n]*$/gm, "")
}

function listPlans(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return listPlans(path)
    return entry.name.endsWith(".plan.md") ? [path] : []
  })
}

function statusOf(content) {
  const match = content.match(/^>\s*Status:\s*(.+)$/m)
  return match ? match[1].trim() : ""
}

// The branches on the "> Branch:" / "> Branches:" line: every backticked name,
// or, written without backticks (older plans), the first word.
function branchesOf(content) {
  const line = content.match(/^>\s*Branch(?:es)?(?:\s*\([^)]*\))?:(.*)$/m)
  if (!line) return []
  const ticked = [...line[1].matchAll(/`([^`]+)`/g)].map((m) => m[1].trim())
  if (ticked.length) return ticked
  const word = line[1].trim().split(/[\s,;(]/)[0]
  return word ? [word] : []
}

function isEditingStatus(status) {
  const upper = status.toUpperCase()
  return EDITING_STATUSES.some((s) => upper.startsWith(s))
}

function belongsToBranch(plan, branch) {
  if (plan.branches.length) return plan.branches.includes(branch)
  return plan.status.toUpperCase().startsWith("IN PROGRESS")
}

// Only file tables grant access.
function fileSections(content) {
  return content
    .split(/^(?=## )/m)
    .filter((section) => FILE_TABLE_HEADING.test(section.split("\n")[0]))
    .join("\n")
}

// Exact paths only (T5), and only from the **first column** of a table row (W3):
// paths mentioned in the Change column or in notes don't grant anything.
export function listsFile(content, rel) {
  return fileSections(content)
    .split("\n")
    .filter((line) => line.trimStart().startsWith("|"))
    .some((row) => {
      const firstCell = row.trimStart().slice(1).split("|")[0]
      return [...firstCell.matchAll(/`([^`\s]+)`/g)].some((m) => m[1] === rel)
    })
}

// Root of the checkout that holds these hooks (the project they belong to).
export const hookRoot = () =>
  canonical(resolve(dirname(fileURLToPath(import.meta.url)), "../.."))

// A checkout governed by this workflow: it has .claude/plans/ (this repo and its
// worktrees do; an unrelated repo with an apps/ folder doesn't).
export const usesWorkflow = (root) => existsSync(join(root, ".claude/plans"))

// Repo-relative path of `path` in its own checkout, or null when the path is
// outside any checkout or in a checkout that doesn't use this workflow.
export function locate(path) {
  const abs = canonical(path)
  const root = checkoutRoot(existsSync(abs) ? abs : dirname(abs))
  if (!root || !usesWorkflow(root)) return null
  return { root, rel: relative(root, abs).replace(/\\/g, "/") }
}

export const isGuarded = (rel) =>
  GUARDED_PREFIXES.some((p) => rel.startsWith(p))

// The checkout's plans that currently grant edits: editing status + this branch.
export function plansFor(repoRoot) {
  const branch = currentBranch(repoRoot)
  const plans = listPlans(join(repoRoot, ".claude/plans")).map((path) => {
    const content = withoutCommentsAndFences(readFileSync(path, "utf8"))
    return {
      path: relative(repoRoot, path),
      content,
      status: statusOf(content),
      branches: branchesOf(content),
    }
  })
  const editing = plans.filter((p) => isEditingStatus(p.status))
  const active = editing.filter((p) => belongsToBranch(p, branch))
  // For *detecting* unplanned changes (post-bash), a file stays planned for the
  // plan's whole life on this branch, not only while edits are allowed: after
  // VERIFIED, through DRAFT deviations and PR OPEN, its changes are still planned.
  // Finished plans (DONE, or COMPLETE in the older flow) stop counting. Branch
  // scoping is the same as for edits: a plan without a Branch line counts only
  // while IN PROGRESS, so old branchless plans can't hide changes on every branch.
  const finished = (p) => /^(DONE|COMPLETE)\b/i.test(p.status)
  const onBranch = plans.filter(
    (p) => !finished(p) && belongsToBranch(p, branch),
  )
  return { branch, editing, active, onBranch }
}

function main() {
  const input = readInput()
  if (!WRITE_TOOLS.includes(input?.tool_name)) return 0

  const target =
    input.tool_input?.file_path ||
    input.tool_input?.notebook_path ||
    input.tool_input?.path
  if (!target) return 0

  // Guard relative to the checkout the file lives in, so an edit in a worktree is
  // checked against that worktree's plans and branch, not the main checkout's.
  const where = locate(target)
  if (!where) return 0 // not in a checkout that uses this workflow
  const { root: repoRoot, rel } = where
  if (!isGuarded(rel)) return 0

  if (rel.includes("/_ic_api/")) {
    process.stderr.write(
      `[SDD Guard] BLOCKED: "${rel}" is a generated Candid binding (_ic_api/). ` +
        `Never edit it by hand; regenerate it from the canister's .did file instead.\n`,
    )
    return 2
  }

  const { branch, editing, active } = plansFor(repoRoot)
  if (active.some((p) => listsFile(p.content, rel))) return 0

  const describe = (p) =>
    `  - ${p.path} (${p.status}${p.branches.length ? `; branch ${p.branches.join(", ")}` : "; no Branch line"})`
  const otherBranch = editing.filter((p) => !active.includes(p))

  process.stderr.write(
    `[SDD Guard] BLOCKED: "${rel}" is not covered by an active plan on branch ` +
      `"${branch ?? "(detached)"}".\n\n` +
      `Active plans (editing status: ${EDITING_STATUSES.join(", ")}; this branch):\n` +
      (active.length ? active.map(describe).join("\n") : "  (none)") +
      "\n" +
      (otherBranch.length
        ? `\nIgnored — editing status but another branch, or no Branch line and not IN PROGRESS:\n` +
          otherBranch.map(describe).join("\n") +
          "\n"
        : "") +
      "\n" +
      (active.length
        ? `Only exact paths in the file table count (no folders or globs). If this file is needed,\n` +
          `record it under "## Deviations" in the plan, add its exact path to the Modified / New Files\n` +
          `table, set the plan back to DRAFT and ask the engineer to approve.\n`
        : `Run /plan <name> (and /spec <name> for feature work), get it approved, then /implement <name>.\n`),
  )
  return 2
}

// Executed as the hook (not imported)? Both sides are canonicalised: a case or
// symlink difference must not make the guard silently skip itself.
const runAsHook =
  Boolean(process.argv[1]) &&
  canonical(fileURLToPath(import.meta.url)) === canonical(process.argv[1])

if (runAsHook) {
  let code
  try {
    code = main()
  } catch (error) {
    // Fail closed: exit 1 would let the edit through (non-blocking error).
    process.stderr.write(
      `[SDD Guard] BLOCKED: the guard hook itself failed, so the edit is blocked to be safe.\n` +
        `${error?.stack ?? error}\n`,
    )
    code = 2
  }
  process.exit(code)
}
