// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
import "fake-indexeddb/auto"
import { TextEncoder, TextDecoder } from "util"
import "whatwg-fetch"
import { webcrypto } from "crypto"

global.TextEncoder = TextEncoder
// @ts-ignore
global.TextDecoder = TextDecoder

// Polyfill for crypto API needed by @dfinity/identity
// @ts-ignore
global.crypto = webcrypto

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
