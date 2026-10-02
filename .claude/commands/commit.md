# /commit

Clean up the repo and create a single well-formed commit covering all staged work. Always run this checklist in order — do not skip steps.

## 1. Understand what changed

- Run `git status` and `git diff HEAD` to see every modified and untracked file.
- Run `git log --oneline -5` to match the project's commit message style.

## 2. Scan for leftovers

Check every new or modified source file for:

- Accidental `console.log` / `console.debug` / `console.warn` that is not intentional
- `TODO`, `FIXME`, `HACK`, `XXX` comments
- Commented-out dead code blocks
- Any file that shouldn't be committed (`.env.local`, generated files listed in `.gitignore`)

Fix anything you find before staging.

## 3. Update housekeeping files

- **Memory** — update memory files to reflect completed work and what is NOT done yet.
- **`.gitignore`** — if any untracked folder/file should never be committed, add it now.

## 4. Stage and commit

- Stage only intentional files — never `git add -A` blindly.
- Explicitly exclude: `.env.local`, auto-generated files, binary or design-asset folders.
- Write a commit message following the project style (`feat:`, `fix:`, `refactor:` etc.). Keep the first line under 72 chars. Add a short body if the change is complex.
- End the message with:
  ```
  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
  ```

## 5. Verify

After committing, run `git status` to confirm the working tree is clean (or explain any intentionally untracked remainders).
