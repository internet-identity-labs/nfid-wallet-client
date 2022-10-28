import { minMax } from "./validation"

describe("validation", () => {
  describe("minMax", () => {
    it("should work", () => {
      expect(minMax({ min: 0 })(-1)).toEqual("value is too small")
    })
  })
})
