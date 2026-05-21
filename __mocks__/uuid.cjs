const { randomUUID } = require("node:crypto")

const v4 = () => randomUUID()
const v1 = () => randomUUID()
const v6 = () => randomUUID()
const v7 = () => randomUUID()

const NIL = "00000000-0000-0000-0000-000000000000"

const validate = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(str),
  )

const version = (str) => {
  const m =
    /^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f])[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i.exec(
      String(str),
    )

  return m ? parseInt(m[1], 16) : null
}

module.exports = { v4, v1, v6, v7, NIL, validate, version, default: { v4, v1, v6, v7, NIL, validate, version } }
