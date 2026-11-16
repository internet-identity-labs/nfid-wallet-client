#!/usr/bin/env node
/**
 * PreToolUse guard for Bash — the early warning for shell commands.
 *
 * pre-tool-use.js only sees the Write/Edit tools. A shell command can change
 * apps/ or packages/ too (sed -i, redirects, cp/mv/rm, formatters, git
 * checkout/reset/pull…), so this hook asks the engineer before running any
 * command that looks like it writes there or rewrites the working tree.
 *
 * "Looks like it touches apps/ or packages/" means one of:
 *   - the command names such a path
 *   - a redirect target resolves into one
 *   - the shell's directory is inside one: the hook input's `cwd` (it persists
 *     between Bash calls), or a `cd` earlier in the same command
 *
 * It never blocks and never auto-approves: it returns the "ask" permission
 * decision, so Claude Code shows the normal approval prompt with the reason.
 * It is a heuristic that errs on the side of asking. post-bash.js is the
 * backstop: after every command it reports any unplanned change it finds,
 * however the command was written.
 *
 * Input: JSON on stdin ({ tool_name: "Bash", cwd, tool_input: { command } }).
 * Output: nothing (no opinion), or a JSON "ask" decision on stdout. Exit 0.
 * If the hook itself fails, it asks as well, rather than letting the command run.
 */

import { isAbsolute, resolve } from "path"

import { isGuarded, locate, readInput } from "./pre-tool-use.js"

// A guarded path named in the command text: apps/… or packages/…, bare or after
// a separator (absolute paths, quotes, `=` in flags).
const GUARDED_PATH = /(?:^|[\s'"=:(/])(?:apps|packages)\//

// git, any global options (-C dir, -c k=v, --no-pager, --git-dir=…), then a
// subcommand that rewrites tracked files in the working tree (workflow rule 4).
// The subcommand must be a whole word (`merge`, not `merge-base`). Matched on
// the unquoted command, so git text inside a quoted string doesn't count. The
// arguments stop at a newline or `;&|`, so one command's exemption (e.g.
// `checkout -b`) can't swallow the next command (`⏎git reset --hard`).
const GIT_TREE_REWRITE =
  /\bgit((?:[ \t]+(?:-[Cc][ \t]+\S+|--[\w-]+(?:=\S+)?|-[a-zA-Z]+))*)[ \t]+(checkout|restore|reset|stash|clean|apply|am|rebase|cherry-pick|revert|pull|merge|switch)(?=\s|$|[;&|])([^;&|\n]*)/

// Forms of those subcommands that only read.
const GIT_READ_ONLY = {
  stash: /^\s+(?:list|show)\b/,
  apply: /\s--(?:check|stat|numstat|summary)\b/,
}

// Writes everything, including apps/ and packages/, without naming them.
const REPO_WIDE_WRITERS = [
  [/\byarn\s+format(?=\s|$|[;&|])/, "`yarn format` rewrites every file"],
  [
    // --write with ".", or any argument containing a wildcard ("**/*.ts", '*')
    /\bprettier\b[^|;&]*--write\b[^|;&]*\s(?:\.(?=\s|$|[;&|])|['"]?[^\s'"]*\*)/,
    "`prettier --write` over many files",
  ],
  [
    /\beslint\b[^|;&]*--fix\b[^|;&]*\s(?:\.(?=\s|$|[;&|])|['"]?[^\s'"]*\*)/,
    "`eslint --fix` over many files",
  ],
  [
    /\bnx\s+(?:g|generate|migrate|format|format:write)(?=\s|$|[;&|])/,
    "an Nx generator/migration/format",
  ],
  [
    /\bnx\b[^|;&]*\b(?:lint|run-many)\b[^|;&]*--fix\b/,
    "`nx lint --fix` rewrites files across whole projects",
  ],
]

function inGuardedArea(path, cwd) {
  if (!path) return false
  const where = locate(isAbsolute(path) ? path : resolve(cwd, path))
  if (!where) return false
  return (
    where.rel === "apps" || where.rel === "packages" || isGuarded(where.rel)
  )
}

// The directories the command runs in: the hook's cwd, then every `cd <dir>`
// in order (`cd apps/x && echo > src/a.ts` writes to apps/x/src/a.ts).
function workingDirs(command, cwd) {
  const dirs = [cwd]
  let current = cwd
  for (const m of command.matchAll(
    /(?:^|[;&|(]\s*)cd\s+(['"]?)([^\s;&|'"]+)\1/g,
  )) {
    current = isAbsolute(m[2]) ? m[2] : resolve(current, m[2])
    dirs.push(current)
  }
  return dirs
}

// Quoted strings blanked out, so `>` inside awk/grep/JS code isn't read as a redirect.
const unquoted = (command) => command.replace(/'[^']*'|"[^"]*"/g, "''")

function redirectTargets(command) {
  const targets = []
  // quoted target: > "apps/a b.ts"
  for (const m of command.matchAll(
    /(?:^|[^-<>&\d=])(?:\d|&)?>>?\s*(['"])([^'"]+)\1/g,
  )) {
    targets.push(m[2])
  }
  // unquoted target: > f, >> f, 1> f, 2> f, &> f — not 2>&1, >&2, ->, =>, or quoted code
  for (const m of unquoted(command).matchAll(
    /(?:^|[^-<>&\d=])(?:\d|&)?>>?\s*(?!&)([^\s;&|'"]+)/g,
  )) {
    targets.push(m[1])
  }
  for (const m of command.matchAll(
    /\btee\b((?:\s+-\w+)*)((?:\s+[^\s;&|-][^\s;&|]*)+)/g,
  )) {
    targets.push(...m[2].trim().split(/\s+/))
  }
  return targets.filter((t) => t !== "/dev/null" && t !== "''")
}

function reasonFor(command, cwd) {
  const dirs = workingDirs(command, cwd)
  const guardedDir = dirs.find((d) => inGuardedArea(d, cwd))
  const touchesGuarded = Boolean(guardedDir) || GUARDED_PATH.test(command)
  const where = guardedDir
    ? `apps/ or packages/ (working in ${guardedDir})`
    : "apps/ or packages/"

  for (const target of redirectTargets(command)) {
    if (
      GUARDED_PATH.test(` ${target}`) ||
      dirs.some((d) => inGuardedArea(target, d))
    ) {
      return `writes to \`${target}\` (shell redirect / tee)`
    }
  }
  if (touchesGuarded) {
    if (/\bsed\b[^|;&]*\s-[a-zA-Z]*i/.test(command))
      return `edits files in place with \`sed -i\` in ${where}`
    if (/\bperl\b[^|;&]*\s-[a-zA-Z]*i/.test(command))
      return `edits files in place with \`perl -i\` in ${where}`
    if (/\bawk\b[^|;&]*-i\s*inplace/.test(command))
      return `edits files in place with \`awk -i inplace\` in ${where}`
    const fileOp = command.match(
      /(?:^|[\s;&|(])(cp|mv|rm|rmdir|touch|mkdir|ln|install|rsync|truncate|chmod|unzip|tar|patch)\s/,
    )
    if (fileOp) return `runs \`${fileOp[1]}\` in ${where}`
    if (/\b(?:prettier\b[^|;&]*--write|eslint\b[^|;&]*--fix)/.test(command)) {
      return `rewrites files in ${where} with a formatter`
    }
    // Inline scripts: the write call can be anywhere, after any number of `;`.
    if (
      /\b(?:node|python3?|ruby|deno|bun)\b/.test(command) &&
      /(?:writeFile|appendFile|createWriteStream|copyFile|rename|unlink|rmSync|mkdirSync|open\([^)]*['"][wax])/.test(
        command,
      )
    ) {
      return `a script writes to ${where}`
    }
  }
  // Git is matched on the unquoted command (quoted text is just text), plus the
  // scripts passed to a shell with -c, which do run (`bash -c "git stash"`).
  const shellScripts = [
    ...command.matchAll(
      /\b(?:ba|z|da|k)?sh\s+(?:-\w+\s+)*-[a-zA-Z]*c\s+(['"])([\s\S]*?)\1/g,
    ),
  ].map((m) => unquoted(m[2]))
  const gitSources = [unquoted(command), ...shellScripts].join("\n")
  for (const git of gitSources.matchAll(new RegExp(GIT_TREE_REWRITE, "g"))) {
    const [, , sub, rest] = git
    // Creating a *new* branch (`switch -c`, `checkout -b`) from a clean tree is
    // routine. The force forms (`switch -C`/`--force-create`, `checkout -B`)
    // reset an existing branch and can orphan commits, and discard flags
    // (`-f`, `--force`, `--discard-changes`) throw away uncommitted work, so
    // those still ask.
    const discards = /(?:^|\s)(?:-f|--force|--discard-changes)(?=\s|$)/.test(
      rest,
    )
    const creates =
      !discards &&
      ((sub === "switch" && /(?:^|\s)(?:-c|--create)(?=\s|$)/.test(rest)) ||
        (sub === "checkout" &&
          /(?:^|\s)-b\s/.test(rest) &&
          !/\s--(?:\s|$)/.test(rest)))
    const readOnly = GIT_READ_ONLY[sub]?.test(rest)
    if (!creates && !readOnly)
      return `\`git ${sub}\` rewrites the working tree (workflow rule 4)`
  }
  for (const [re, why] of REPO_WIDE_WRITERS) if (re.test(command)) return why
  return null
}

function ask(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason:
          `[SDD Guard] This shell command ${reason}. Edits to apps/ and packages/ go through ` +
          `the Edit/Write tools so the plan guard can check them. Approve only if this is intended.`,
      },
    }),
  )
}

try {
  const input = readInput()
  if (input?.tool_name === "Bash") {
    const cwd = input.cwd || process.cwd()
    const reason = reasonFor(String(input.tool_input?.command ?? ""), cwd)
    if (reason) ask(reason)
  }
} catch (error) {
  ask(`couldn't be checked (the hook failed: ${error?.message ?? error})`)
}
process.exit(0)
