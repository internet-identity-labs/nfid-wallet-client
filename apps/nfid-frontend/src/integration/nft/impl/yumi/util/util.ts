import { WithImplicitCoercion } from "node:buffer"

export const array2string = (buf: ArrayBuffer | Uint8Array): string => {
  return new TextDecoder().decode(buf)
}
