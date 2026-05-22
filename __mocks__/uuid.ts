import { randomUUID } from "node:crypto"

export const v4 = () => randomUUID()
export const v1 = () => randomUUID()
export const v6 = () => randomUUID()
export const v7 = () => randomUUID()
export const NIL = "00000000-0000-0000-0000-000000000000"

export const validate = (str: unknown) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(str),
  )

export const version = (str: unknown) => {
  const m =
    /^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f])[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i.exec(
      String(str),
    )
  return m ? parseInt(m[1], 16) : null
}

export default { v4, v1, v6, v7, NIL, validate, version }
