import { getInitialSnapshot } from "xstate"

import AuthWithGoogleMachine from "./auth-with-google"

describe("AuthWithGoogleMachine", () => {
  it("should be defined and start in FetchKeys", () => {
    expect(AuthWithGoogleMachine).toBeDefined()

    const snapshot = getInitialSnapshot(AuthWithGoogleMachine)
    expect(snapshot.value).toBe("FetchKeys")
  })
})
