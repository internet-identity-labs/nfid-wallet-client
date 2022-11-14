/**
 * @jest-environment jsdom
 */
import { verifyPhoneNumber } from "."

const buffer_1 = require("@dfinity/identity/lib/cjs/buffer")
const der_1 = require("@dfinity/identity/lib/cjs/identity/der")

describe("Lambda phone verification integration", () => {
  it("exists", () => {
    expect(verifyPhoneNumber).toBeDefined()
  })
})
