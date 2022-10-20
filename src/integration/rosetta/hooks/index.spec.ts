/**
 * @jest-environment jsdom
 */
import { sumE8sICPString } from "./use-balance-icp-all"

describe("rosetta queries suite", () => {
  describe("sumE8sICPString", () => {
    it("shoudl sum e8s string values", () => {
      expect(sumE8sICPString("0.1", "0.2")).toBe("0.3")
    })
  })
})
