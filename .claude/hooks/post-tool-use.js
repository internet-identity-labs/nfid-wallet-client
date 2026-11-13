#!/usr/bin/env node
/**
 * PostToolUse hook — after a Write/Edit to a file under apps/ or packages/ of
 * the git checkout the file belongs to (main checkout or a worktree), runs
 * ESLint --fix and then Prettier on that one file, from that checkout.
 * Prettier runs last so ESLint's fixes end up formatted.
 *
 * Input: JSON on stdin ({ tool_name, tool_input, tool_response }).
 * Always exits 0: formatting/lint problems are surfaced by the next lint run,
 * not by failing the edit.
 */

import { execFileSync } from "child_process"
import { existsSync } from "fs"
import { extname, join } from "path"

import {
  canonical,
  hookRoot,
  isGuarded,
  locate,
  readInput,
  WRITE_TOOLS,
} from "./pre-tool-use.js"

const LINT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"])
const FORMAT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css",
  ".md",
])

// Prefer the checkout's own tools; a fresh worktree may have no node_modules,
// so fall back to the checkout that holds this hook.
function binDir(root) {
  const own = join(root, "node_modules/.bin")
  if (existsSync(own)) return own
  return join(hookRoot(), "node_modules/.bin")
}

function run(bin, args, root) {
  try {
    execFileSync(join(binDir(root), bin), args, {
      cwd: root,
      stdio: "pipe",
      timeout: 60_000,
    })
  } catch {
    // Non-fatal: remaining issues show up in the next lint/format check.
  }
}

let input = null
try {
  input = readInput()
} catch {
  // Formatting is best-effort; unreadable input just means nothing to format.
}
if (!input || !WRITE_TOOLS.includes(input.tool_name)) process.exit(0)

const target = input.tool_input?.file_path || input.tool_input?.path
if (!target || !existsSync(target)) process.exit(0)

const where = locate(target)
if (!where || !isGuarded(where.rel)) process.exit(0)

const absPath = canonical(target)
const ext = extname(absPath)
if (LINT_EXTENSIONS.has(ext)) run("eslint", ["--fix", absPath], where.root)
if (FORMAT_EXTENSIONS.has(ext))
  run("prettier", ["--write", absPath], where.root)

process.exit(0)
