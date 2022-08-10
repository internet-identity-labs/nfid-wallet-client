/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { interpret } from "xstate"

import { ii } from "frontend/integration/actors"

import RemoteSenderMachine from "./remote-sender"

const challengeMock = jest.fn(async () => ({
  png_base64: "string",
  challenge_key: "ChallengeKey",
}))

// @ts-ignore: with options
ii.create_challenge = challengeMock

export const getDataFromPath = jest.fn(async () => ({
  authRequest: {
    maxTimeToLive: BigInt(1000),
    hostname: "",
    sessionPublicKey: new Uint8Array([]),
  },
  pubsubChannel: "",
}))

export const getAppMeta = jest.fn(async () => ({
  name: "",
  logo: "",
}))

const testMachine = RemoteSenderMachine.withConfig({
  services: {
    getDataFromPath,
    getAppMeta,
  },
}).withContext({})

describe("Remote Sender Machine", () => {
  interpret(testMachine).start()

  it("retrieves session data upon initialization", () => {
    expect(getDataFromPath.mock.calls.length).toBe(1)
  })

  it("retrieves requesting app meta upon initialization", () => {
    expect(getAppMeta.mock.calls.length).toBe(1)
  })

  // TODO: Fix this feature!
  // it("requests captcha immediately", () => {
  //   expect(challengeMock.mock.calls.length).toBe(1)
  // })

  describe("authentication", () => {
    it("invokes authentication machine after initialization", (done) => {
      interpret(testMachine)
        .onTransition((state) => {
          if (state.matches("AuthenticationMachine")) {
            expect(state.matches("AuthenticationMachine")).toBeTruthy()
            done()
          }
        })
        .start()
    })

    it("invokes authentication machine with correct context", (done) => {
      interpret(testMachine)
        .onTransition((state) => {
          if (state.matches("AuthenticationMachine")) {
            const context = state.children.authenticate.getSnapshot().context
            expect(Object.keys(context)).toContain("appMeta")
            expect(Object.keys(context)).toContain("authRequest")
            done()
          }
        })
        .start()
    })
  })
})
