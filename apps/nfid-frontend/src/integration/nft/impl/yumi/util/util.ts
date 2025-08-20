import { WithImplicitCoercion } from "node:buffer"

export const array2string = (
  buf: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>,
): string => {
  const decoder = new TextDecoder()
  return decoder.decode(Buffer.from(buf))
}
