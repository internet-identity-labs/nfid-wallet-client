/**
 * @jest-environment jsdom
 */
import { slugify } from "."

describe("ui utils", () => {
  describe("slugify", () => {
    it("should turn arbitrary text into slugs", () => {
      expect(slugify("Hello World!")).toBe("hello-world")
    })
  })
})
