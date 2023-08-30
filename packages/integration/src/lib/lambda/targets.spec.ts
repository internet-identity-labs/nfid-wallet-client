import { validateTargets } from "./targets"

describe("Targets validation", () => {
  jest.setTimeout(50000)

  it("validate", async function () {
    try {
      await validateTargets(["txkre-oyaaa-aaaap-qa3za-cai"], "nfid.one")
    } catch (e) {
      fail("Should pass")
    }
  })

  it("validate fail", async function () {
    try {
      await validateTargets(["txkre-oyaaa-aaaap-qa3za-cai"], "hernia.one")
    } catch (e) {
      expect((e as Error).message).toContain(
        "Target canister txkre-oyaaa-aaaap-qa3za-cai does not support",
      )
    }
  })
})
