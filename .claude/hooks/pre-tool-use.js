#!/usr/bin/env node
/**
 * PreToolUse guard — blocks writes to /apps or /packages unless an active
 * .plan.md exists with at least one unchecked checkbox (- [ ]).
 *
 * Claude Code invokes this hook before any Write/Edit/MultiEdit tool call.
 * Input arrives on stdin as JSON: { tool_name, tool_input }
 * Exit 0 = allow. Exit 1 + stderr message = block.
 */

import { readFileSync, readdirSync, existsSync } from "fs"
import { resolve, relative } from "path"

const REPO_ROOT = resolve(import.meta.dirname, "../..")
const PLANS_DIR = resolve(REPO_ROOT, ".claude/plans")
const GUARDED_PREFIXES = ["apps/", "packages/"]

// Files that are always safe to touch without a plan
const ALWAYS_ALLOWED = [".claude/", "CLAUDE.md"]

function readStdin() {
  try {
    return JSON.parse(readFileSync("/dev/stdin", "utf8"))
  } catch {
    return null
  }
}

function getTargetPath(input) {
  // Works for Write, Edit, MultiEdit tool shapes
  return input?.tool_input?.file_path || input?.tool_input?.path || null
}

function isGuarded(filePath) {
  const rel = relative(REPO_ROOT, filePath).replace(/\\/g, "/")
  if (ALWAYS_ALLOWED.some((p) => rel.startsWith(p))) return false
  return GUARDED_PREFIXES.some((p) => rel.startsWith(p))
}

function hasActivePlan() {
  if (!existsSync(PLANS_DIR)) return false
  const files = readdirSync(PLANS_DIR).filter((f) => f.endsWith(".plan.md"))
  for (const file of files) {
    const content = readFileSync(resolve(PLANS_DIR, file), "utf8")
    if (content.includes("- [ ]")) return true
  }
  return false
}

const input = readStdin()
if (!input) process.exit(0)

const { tool_name } = input
const WRITE_TOOLS = ["Write", "Edit", "MultiEdit", "NotebookEdit"]

if (!WRITE_TOOLS.includes(tool_name)) process.exit(0)

const targetPath = getTargetPath(input)
if (!targetPath) process.exit(0)

const absPath = resolve(targetPath)
if (!isGuarded(absPath)) process.exit(0)

if (!hasActivePlan()) {
  process.stderr.write(
    `\n[SDD Guard] BLOCKED: Cannot modify "${relative(REPO_ROOT, absPath)}".\n` +
      `No active .plan.md found with an unchecked checkbox.\n\n` +
      `Run the workflow:\n` +
      `  1. /ui-brainstorming [feature-name]  →  create & approve spec\n` +
      `  2. /ui-planning [feature-name]       →  create & approve plan\n` +
      `  3. /execute-ui-plan [feature-name]   →  execute one step at a time\n\n`,
  )
  process.exit(1)
}

process.exit(0)
