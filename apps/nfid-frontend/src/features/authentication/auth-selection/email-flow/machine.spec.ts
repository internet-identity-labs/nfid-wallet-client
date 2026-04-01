import { getInitialSnapshot } from "xstate"

import AuthWithEmailMachine from "./machine"

describe("AuthWithEmailMachine", () => {
  it("should be defined and start in SendVerificationEmail", () => {
    expect(AuthWithEmailMachine).toBeDefined()

    const snapshot = getInitialSnapshot(AuthWithEmailMachine)
    expect(snapshot.value).toBe("SendVerificationEmail")
  })
})
