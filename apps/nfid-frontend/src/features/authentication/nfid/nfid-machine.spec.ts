import { createActor } from "xstate"

import NFIDAuthMachine from "./nfid-machine"

describe("NFIDAuthMachine", () => {
  it("should be defined and start in AuthenticationMachine", () => {
    expect(NFIDAuthMachine).toBeDefined()

    const actor = createActor(NFIDAuthMachine).start()
    expect(actor.getSnapshot().value).toBe("AuthenticationMachine")
    actor.stop()
  })
})
