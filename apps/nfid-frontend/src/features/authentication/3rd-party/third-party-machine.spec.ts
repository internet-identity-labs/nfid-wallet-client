import { getInitialSnapshot } from "xstate"

import ThirdPartyAuthMachine from "./third-party-machine"

describe("ThirdPartyAuthMachine", () => {
  it("should be defined and start in Start", () => {
    expect(ThirdPartyAuthMachine).toBeDefined()

    const snapshot = getInitialSnapshot(ThirdPartyAuthMachine)
    expect(snapshot.value).toHaveProperty("Start")
  })
})
