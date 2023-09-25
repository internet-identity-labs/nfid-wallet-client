import { validateTargets } from "./targets"

describe("Targets validation", () => {
  jest.setTimeout(50000)

  it("validate", async function () {
    try {
      await validateTargets(["irshc-3aaaa-aaaam-absla-cai"], "nfid.one")
    } catch (e) {
      fail("Should pass")
    }
  })

  it("validate fail", async function () {
    try {
      await validateTargets(["irshc-3aaaa-aaaam-absla-cai"], "hernia.one")
    } catch (e) {
      expect((e as Error).message).toContain(
        "Target canister irshc-3aaaa-aaaam-absla-cai does not support",
      )
    }
  })
})
