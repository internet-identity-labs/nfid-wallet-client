/**
 * @jest-environment jsdom
 */
import { byGoogleDevice, byNotGoogleDevice } from "./hooks"

describe("hooks test suite", () => {
  describe("filterGoogleDevice", () => {
    it("should filter correctly", () => {
      expect(byGoogleDevice({ browser: "google account" })).toBe(true)
      expect(byNotGoogleDevice({ browser: "abc google with account" })).toBe(
        true,
      )
      expect(byNotGoogleDevice({ browser: "cross platform" })).toBe(false)
      expect(byNotGoogleDevice({ browser: "Chrome" })).toBe(false)
    })
  })
})
