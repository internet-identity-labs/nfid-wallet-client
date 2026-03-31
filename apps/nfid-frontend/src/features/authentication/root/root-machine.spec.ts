import { interpret } from "xstate"

import AuthenticationMachine from "./root-machine"

describe("AuthenticationMachine", () => {
  it("should be defined and start in AuthSelection", () => {
    expect(AuthenticationMachine).toBeDefined()

    const service = interpret(AuthenticationMachine).start()
    expect(service.getSnapshot().value).toBe("AuthSelection")
    service.stop()
  })
})
