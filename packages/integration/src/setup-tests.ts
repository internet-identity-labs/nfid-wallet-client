import { Crypto } from "@peculiar/webcrypto"
import "fake-indexeddb/auto"
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"

jest.retryTimes(3, { logErrorsBeforeRetry: true })

global.crypto = new Crypto()

global.TextEncoder = TextEncoder

// @ts-ignore
global.TextDecoder = TextDecoder

Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    return () => `${this.toString()}n`
  },
})
