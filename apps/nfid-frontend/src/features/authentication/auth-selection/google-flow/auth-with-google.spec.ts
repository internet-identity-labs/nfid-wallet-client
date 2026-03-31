import { interpret } from "xstate"

import AuthWithGoogleMachine from "./auth-with-google"

describe("AuthWithGoogleMachine", () => {
  it("should be defined and start in FetchKeys", () => {
    expect(AuthWithGoogleMachine).toBeDefined()

    const service = interpret(AuthWithGoogleMachine).start()
    expect(service.getSnapshot().value).toBe("FetchKeys")
    service.stop()
  })
})
