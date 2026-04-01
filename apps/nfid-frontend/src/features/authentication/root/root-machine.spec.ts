import { createActor } from "xstate"

import AuthenticationMachine from "./root-machine"

describe("AuthenticationMachine", () => {
  it("should be defined and start in AuthSelection", () => {
    expect(AuthenticationMachine).toBeDefined()

    const actor = createActor(AuthenticationMachine).start()
    expect(actor.getSnapshot().value).toBe("AuthSelection")
    actor.stop()
  })
})
