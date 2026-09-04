# Command: write-unit-tests

Write unit tests for a given file or feature in the nfid-frontend project.

## Usage

`/write-unit-tests <path-to-file-or-feature>`

## Steps

**1. Identify the target**

- Read the file passed as the argument.
- Determine its type: service/class, utility function, XState machine, or React component/hook.
- Check if a `*.spec.ts` / `*.spec.tsx` file already exists alongside it; if so, read it and extend rather than overwrite.

**2. Choose the right test pattern**

| Target type      | File extension | Key patterns                                                                                                  |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| Service / class  | `.spec.ts`     | Mock all external dependencies with `jest.mock(...)` before any imports; test each public method              |
| Utility function | `.spec.ts`     | No mocks needed; table-driven `it` cases covering edge values and typical inputs                              |
| XState machine   | `.spec.ts`     | `interpret(machine).start()` + send events; assert `getSnapshot().value` and context                          |
| React component  | `.spec.tsx`    | `@testing-library/react` `render` + `screen` queries; test render, loading, error, and happy-path interaction |
| React hook       | `.spec.ts`     | `@testing-library/react` `renderHook`                                                                         |

**3. Mock rules**

- `jest.mock(...)` calls must appear **before** any `import` of the module under test (Jest hoists them).
- Use path aliases as they appear in source: `frontend/integration/...` or `@nfid/...`.
- Never mock the module under test itself.
- Use `jest.fn().mockResolvedValue(...)` for async dependencies; `jest.fn().mockReturnValue(...)` for sync.
- Integration tests that hit real networks must use `it.skip(...)` with a comment explaining when to unskip.

**4. Structure**

```ts
describe("<ClassName or featureName>", () => {
  // optional: jest.setTimeout(N) for async-heavy tests

  describe("<method or scenario>", () => {
    it("should <expected behaviour>", async () => {
      // arrange
      // act
      // assert
    })
  })
})
```

**5. Coverage targets**
The project enforces 100% line/function/statement coverage and 99% branch coverage when `collectCoverage` is enabled. Aim to cover:

- Happy path
- Edge inputs (empty, undefined, zero, boundary values)
- Error / rejection paths
- All conditional branches visible in the source

**6. Run and verify**
After writing the file, run:

```
yarn nx test nfid-frontend --testPathPattern=<spec-file-name>
```

Fix any failures before reporting done.

## Module path aliases

- `frontend/<path>` → `apps/nfid-frontend/src/<path>`
- `@nfid/<package>` → `packages/<package>/src`
- Asset/CSS imports are auto-mocked via `mocks/fileMock.ts`
