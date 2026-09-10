import { createActor } from "xstate"

import ThirdPartyAuthMachine from "./third-party-machine"

describe("ThirdPartyAuthMachine", () => {
  it("should be defined and start in Start", () => {
    expect(ThirdPartyAuthMachine).toBeDefined()

    const actor = createActor(ThirdPartyAuthMachine).start()
    expect(actor.getSnapshot().value).toHaveProperty("Start")
    actor.stop()
  })
})
