import { createActor } from "xstate"

import AuthWithEmailMachine from "./machine"

describe("AuthWithEmailMachine", () => {
  it("should be defined and start in SendVerificationEmail", () => {
    expect(AuthWithEmailMachine).toBeDefined()

    const actor = createActor(AuthWithEmailMachine).start()
    expect(actor.getSnapshot().value).toBe("SendVerificationEmail")
    actor.stop()
  })
})
