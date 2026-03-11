// CJS shim for uuid v13 (pure ESM) — used by Jest only
const { randomUUID } = require("crypto")

module.exports = {
  v4: () => randomUUID(),
  v1: () => randomUUID(),
  v6: () => randomUUID(),
  v7: () => randomUUID(),
  NIL: "00000000-0000-0000-0000-000000000000",
  validate: (str) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      String(str),
    ),
  version: (str) => {
    const m =
      /^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f])[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i.exec(
        String(str),
      )
    return m ? parseInt(m[1], 16) : null
  },
}
