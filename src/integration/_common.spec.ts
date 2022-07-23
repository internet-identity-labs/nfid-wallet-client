/**
 * @jest-environment jsdom
 */
import { typeResponse } from "./_common"

describe("_common test suite", () => {
  describe("typeResponse", () => {
    it("should return empty array in success state", () => {
      const response = typeResponse<Array<string>>({
        data: [[]],
        error: [],
        status_code: 200,
      })
      expect(response).toEqual([])
    })
  })
})
