/**
 * @jest-environment jsdom
 */
import { selectAccountAction } from "./authorization"

describe("authorization", () => {
  describe("selectAccountAction", () => {
    it("should select the right action", () => {
      expect(selectAccountAction(0, 5)).toBe("CREATE_ACCOUNT")
      expect(selectAccountAction(0, 1)).toBe("CREATE_ACCOUNT")
      expect(selectAccountAction(1, 1)).toBe("SELECT_ACCOUNT")
    })
  })
})
export {}
