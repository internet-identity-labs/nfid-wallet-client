import { interpret } from "xstate"

import ThirdPartyAuthMachine from "./third-party-machine"

describe("ThirdPartyAuthMachine", () => {
  it("should be defined and start in Start", () => {
    expect(ThirdPartyAuthMachine).toBeDefined()

    const service = interpret(ThirdPartyAuthMachine).start()
    expect(service.getSnapshot().value).toHaveProperty("Start")
    service.stop()
  })
})
