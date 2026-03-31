import { interpret } from "xstate"

import AuthWithEmailMachine from "./machine"

describe("AuthWithEmailMachine", () => {
  it("should be defined and start in SendVerificationEmail", () => {
    expect(AuthWithEmailMachine).toBeDefined()

    const service = interpret(AuthWithEmailMachine).start()
    expect(service.getSnapshot().value).toBe("SendVerificationEmail")
    service.stop()
  })
})
