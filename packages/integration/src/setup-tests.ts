import "fake-indexeddb/auto"
import { webcrypto } from "crypto"
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"

jest.retryTimes(3, { logErrorsBeforeRetry: true })

// Prefer Node's WebCrypto so ECDSA PKCS#8 imports work with `jose@6`.
global.crypto = webcrypto as unknown as Crypto

global.TextEncoder = TextEncoder

// @ts-ignore
global.TextDecoder = TextDecoder

Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    return () => `${this.toString()}n`
  },
})
