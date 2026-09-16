import { createActor } from "xstate"

import { transferMachine } from "./machine"

describe("transferMachine", () => {
  it("should be defined and start in Hidden", () => {
    expect(transferMachine).toBeDefined()

    // Static check: initial state
    expect(createActor(transferMachine).getSnapshot().value).toBe("Hidden")

    const service = createActor(transferMachine).start()
    expect(service.getSnapshot().value).toBe("Hidden")
    service.stop()
  })
})
