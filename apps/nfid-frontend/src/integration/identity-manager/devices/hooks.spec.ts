/**
 * @jest-environment jsdom
 */
import { byGoogleDevice, byNotGoogleDevice } from "./hooks"

describe("hooks test suite", () => {
  describe("filterGoogleDevice", () => {
    it("should filter correctly", () => {
      expect(byGoogleDevice({ browser: "Chrome with google account" })).toBe(
        true,
      )
      expect(byNotGoogleDevice({ browser: "abc with account" })).toBe(true)
      expect(byNotGoogleDevice({ browser: "cross platform" })).toBe(true)
      expect(byNotGoogleDevice({ browser: "Chrome" })).toBe(true)
    })
  })
})
