/**
 * @jest-environment jsdom
 */
import { slugify } from "./browser"

describe("ui utils", () => {
  describe("slugify", () => {
    it("should turn arbitrary text into slugs", () => {
      expect(slugify("Hello World!")).toBe("hello-world")
    })
  })
})
