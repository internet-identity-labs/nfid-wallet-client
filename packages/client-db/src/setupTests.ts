import { serialize, deserialize } from "v8"
import "fake-indexeddb/auto"
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"

if (typeof structuredClone === "undefined") {
  (global as unknown as Record<string, unknown>)["structuredClone"] = (
    value: unknown,
  ) => deserialize(serialize(value))
}

global.TextEncoder = TextEncoder
// @ts-ignore
global.TextDecoder = TextDecoder
