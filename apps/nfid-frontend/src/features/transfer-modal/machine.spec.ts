import { createActor } from "xstate"

import { transferMachine } from "./machine"

describe("transferMachine", () => {
  it("should be defined and start in Hidden", () => {
    expect(transferMachine).toBeDefined()

    const actor = createActor(transferMachine).start()
    expect(actor.getSnapshot().value).toBe("Hidden")
    actor.stop()
  })
})
