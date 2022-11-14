/**
 * @jest-environment jsdom
 */
import { unpackResponse } from "./_common"

describe("_common test suite", () => {
  describe("unpackResponse", () => {
    it("should return empty array in success state", () => {
      const response = unpackResponse<Array<string>>({
        data: [[]],
        error: [],
        status_code: 200,
      })
      expect(response).toEqual([])
    })
  })
})
