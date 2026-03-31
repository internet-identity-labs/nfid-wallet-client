import { interpret } from "xstate"

import { IdentityKitRPCMachine } from "./machine"

jest.mock("./service/call-canister.service", () => {
  return {
    CallCanisterService: jest.fn().mockImplementation(() => ({
      call: jest.fn(),
    })),
  }
})

describe("IdentityKitRPCMachine", () => {
  it("should be defined", () => {
    expect(IdentityKitRPCMachine).toBeDefined()

    const service = interpret(IdentityKitRPCMachine)
    service.stop()
  })
})
