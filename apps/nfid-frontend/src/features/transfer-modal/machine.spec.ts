import { interpret } from "xstate"

import { transferMachine } from "./machine"

describe("transferMachine", () => {
  it("should be defined and start in Hidden", () => {
    expect(transferMachine).toBeDefined()

    // Static check: initial state and minimal context
    expect(transferMachine.initialState.value).toBe("Hidden")
    expect(transferMachine.initialState.context).toMatchObject({
      error: undefined,
    })

    const service = interpret(transferMachine).start()
    expect(service.getSnapshot().value).toBe("Hidden")
    service.stop()
  })
})
