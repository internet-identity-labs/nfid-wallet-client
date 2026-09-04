#!/usr/bin/env node
/**
 * PostToolUse hook — after any Write/Edit to apps/ or packages/, runs
 * ESLint --fix and Prettier --write on the modified file.
 *
 * Input on stdin: { tool_name, tool_input, tool_response }
 * This hook is fire-and-forget; exit code is ignored by Claude Code.
 */

import { execSync } from "child_process"
import { resolve, relative, extname } from "path"
import { existsSync } from "fs"

const REPO_ROOT = resolve(import.meta.dirname, "../..")
const WRITE_TOOLS = ["Write", "Edit", "MultiEdit"]
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

function readStdin() {
  try {
    const raw = []
    const fd = 0 // stdin fd
    const buf = Buffer.alloc(65536)
    let n
    while ((n = require("fs").readSync(fd, buf, 0, buf.length, null)) > 0) {
      raw.push(buf.slice(0, n))
    }
    return JSON.parse(Buffer.concat(raw).toString("utf8"))
  } catch {
    return null
  }
}

function getTargetPath(input) {
  return input?.tool_input?.file_path || input?.tool_input?.path || null
}

function run(cmd, cwd) {
  try {
    execSync(cmd, { cwd, stdio: "pipe" })
  } catch {
    // lint/format errors are surfaced in next tool call; non-fatal here
  }
}

const input = readStdin()
if (!input) process.exit(0)

const { tool_name } = input
if (!WRITE_TOOLS.includes(tool_name)) process.exit(0)

const targetPath = getTargetPath(input)
if (!targetPath) process.exit(0)

const absPath = resolve(targetPath)
if (!existsSync(absPath)) process.exit(0)

const rel = relative(REPO_ROOT, absPath).replace(/\\/g, "/")
const isInRepo = !rel.startsWith("..")
const isGuarded =
  isInRepo && (rel.startsWith("apps/") || rel.startsWith("packages/"))
if (!isGuarded) process.exit(0)

const ext = extname(absPath)

if (FORMAT_EXTENSIONS.has(ext)) {
  run(`yarn prettier --write "${absPath}"`, REPO_ROOT)
}

if (LINT_EXTENSIONS.has(ext)) {
  run(`yarn nx lint nfid-frontend --fix --quiet`, REPO_ROOT)
}

process.exit(0)
