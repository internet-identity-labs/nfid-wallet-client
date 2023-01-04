import { bigIntMillisecondsToSeconds } from "./date"

describe("date", () => {
  describe("bigIntMillisecondsToSeconds", () => {
    it("should return seconds", () => {
      expect(bigIntMillisecondsToSeconds(1671453535860964553n)).toEqual(
        1671453535860,
      )
    })
  })
})
