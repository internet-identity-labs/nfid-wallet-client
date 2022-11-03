/**
 * @jest-environment jsdom
 */
import { byGoogleDevice, byNotGoogleDevice } from "./hooks"

describe("hooks test suite", () => {
  describe("filterGoogleDevice", () => {
    it("should filter correctly", () => {
      expect(byGoogleDevice({ browser: "Google account" })).toBe(true)
      expect(byGoogleDevice({ browser: "cross platform" })).toBe(true)
      expect(byNotGoogleDevice({ browser: "Google account" })).toBe(false)
      expect(byNotGoogleDevice({ browser: "cross platform" })).toBe(false)
    })
  })
})
