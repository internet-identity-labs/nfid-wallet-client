import { stringify } from "./test-utils"

describe("test-utils", () => {
  describe("stringify", () => {
    it("should serialize bigint", () => {
      expect(stringify({ test: BigInt(0) })).toEqual(
        JSON.stringify({ test: "0n" }, null, 2),
      )
    })
  })
})
