/**
 * @jest-environment jsdom
 */
import { storeSignIn } from "src/integration/lambda/auth-stats/index"

describe("auth_state suite", () => {
  jest.setTimeout(50000)

  describe("Store Sign In Test", () => {
    it("sore auth", async function () {
      try {
        await storeSignIn({
          principal: "a",
          blockchainAddress: "b",
          chain: "c",
          application: "d",
          billable: true,
        })
      } catch (e) {
        throw new Error("Should not fail")
      }
    })
  })
})
