import { interpret } from "xstate"

import { transferMachine } from "./machine"

describe("transferMachine", () => {
  it("should be defined and start in Hidden", () => {
    expect(transferMachine).toBeDefined()

    // Static check: initial state
    expect(transferMachine.initialState.value).toBe("Hidden")

    const service = interpret(transferMachine).start()
    expect(service.getSnapshot().value).toBe("Hidden")
    service.stop()
  })
})
