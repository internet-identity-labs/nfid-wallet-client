import "fake-indexeddb/auto"
import { webcrypto } from "crypto"
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"

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
