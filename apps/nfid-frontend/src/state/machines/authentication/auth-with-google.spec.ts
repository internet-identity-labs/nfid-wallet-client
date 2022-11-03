/**
 * @jest-environment jsdom
 */
import { interpret } from "xstate"

import AuthWithGoogleMachine from "./auth-with-google"

describe("auth-with-google", () => {
  it("should do something", () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ alternativeOrigins: [] }),
      }),
    ) as jest.Mock
    const state = interpret(
      AuthWithGoogleMachine.withContext({ jwt: "my-token" }),
    ).start()
  })
})
export {}
