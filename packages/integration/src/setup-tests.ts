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

// `jose` relies on `structuredClone` in its WebCrypto build.
// Jest's runtime may not provide it depending on environment/polyfills.
// @ts-ignore
global.structuredClone ??= (value: unknown) => JSON.parse(JSON.stringify(value))

Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    return () => `${this.toString()}n`
  },
})
