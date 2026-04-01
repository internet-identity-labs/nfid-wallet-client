import { getInitialSnapshot } from "xstate"

import NFIDAuthMachine from "./nfid-machine"

describe("NFIDAuthMachine", () => {
  it("should be defined and start in AuthenticationMachine", () => {
    expect(NFIDAuthMachine).toBeDefined()

    // Static check: initial state
    expect(getInitialSnapshot(NFIDAuthMachine).value).toBe(
      "AuthenticationMachine",
    )

    expect(getInitialSnapshot(NFIDAuthMachine).value).toBe(
      "AuthenticationMachine",
    )
  })
})
