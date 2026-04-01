import { createActor } from "xstate"

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

    const actor = createActor(IdentityKitRPCMachine)
    actor.stop()
  })
})
