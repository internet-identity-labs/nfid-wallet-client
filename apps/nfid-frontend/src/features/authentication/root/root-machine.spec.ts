import { createActor } from "xstate"

import AuthenticationMachine from "./root-machine"

describe("AuthenticationMachine", () => {
  it("should be defined and start in CheckWallets", () => {
    expect(AuthenticationMachine).toBeDefined()

    const service = createActor(AuthenticationMachine).start()
    expect(service.getSnapshot().value).toBe("CheckWallets")
    service.stop()
  })
})
