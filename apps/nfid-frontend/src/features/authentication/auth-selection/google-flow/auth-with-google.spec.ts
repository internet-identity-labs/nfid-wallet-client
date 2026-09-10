import { createActor } from "xstate"

import AuthWithGoogleMachine from "./auth-with-google"

describe("AuthWithGoogleMachine", () => {
  it("should be defined and start in FetchKeys", () => {
    expect(AuthWithGoogleMachine).toBeDefined()

    const actor = createActor(AuthWithGoogleMachine).start()
    expect(actor.getSnapshot().value).toBe("FetchKeys")
    actor.stop()
  })
})
