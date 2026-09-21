import "fake-indexeddb/auto"
import { serialize, deserialize } from "v8"
import { webcrypto } from "crypto"
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"

// fake-indexeddb v6 calls structuredClone as a bare global in its CJS build;
// Jest's VM context doesn't always expose Node built-ins onto global automatically.
if (!global.structuredClone) {
  (global as unknown as Record<string, unknown>)["structuredClone"] = (
    value: unknown,
  ) => deserialize(serialize(value))
}

jest.retryTimes(3, { logErrorsBeforeRetry: true })

Object.defineProperty(global, "crypto", {
  value: webcrypto as unknown as Crypto,
  configurable: true,
  writable: true,
})

global.TextEncoder = TextEncoder

// @ts-ignore
global.TextDecoder = TextDecoder

Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    return () => `${this.toString()}n`
  },
})
