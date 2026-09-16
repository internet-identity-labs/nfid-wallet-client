// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

// jsdom does not expose structuredClone; polyfill it for fake-indexeddb
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = <T>(val: T): T => JSON.parse(JSON.stringify(val))
}

// @simplewebauthn/server v14 reads globalThis.SubtleCrypto at module init time; not exposed in jest env
if (typeof (globalThis as any).SubtleCrypto === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).SubtleCrypto =
    (globalThis as any).crypto?.subtle?.constructor ?? {}
}

import "@testing-library/jest-dom"
import "fake-indexeddb/auto"
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"

global.TextEncoder = TextEncoder
// @ts-ignore
global.TextDecoder = TextDecoder

// Global userAgent Mock
// define userAgent within your tests by
// global.userAgent = 'iPhone'
// https://vincent-benoit.medium.com/how-to-test-useragent-with-jest-inside-a-react-application-cfd87648843a
Object.defineProperty(
  window.navigator,
  "userAgent",
  ((value) => ({
    get() {
      return value
    },
    set(v) {
      value = v
    },
  }))(window.navigator.userAgent),
)

Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    return () => `${this.toString()}n`
  },
})
