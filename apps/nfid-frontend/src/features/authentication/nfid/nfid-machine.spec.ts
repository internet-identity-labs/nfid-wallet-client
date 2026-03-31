import { interpret } from "xstate"

import NFIDAuthMachine from "./nfid-machine"

describe("NFIDAuthMachine", () => {
  it("should be defined and start in AuthenticationMachine", () => {
    expect(NFIDAuthMachine).toBeDefined()

    // Static check: initial state
    expect(NFIDAuthMachine.initialState.value).toBe("AuthenticationMachine")

    const service = interpret(NFIDAuthMachine).start()
    expect(service.getSnapshot().value).toBe("AuthenticationMachine")
    service.stop()
  })
})
