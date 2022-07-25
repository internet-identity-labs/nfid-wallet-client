/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { render, fireEvent, waitFor, screen, act } from "@testing-library/react"
import React from "react"

import { mockIdentityClientAuthEvent } from "frontend/integration/windows/__mock"
import IDPMachine from "frontend/state/machines/authorization/idp"

import IDPCoordinator from "./idp"
import AuthenticationMachine from "frontend/state/machines/authentication/authentication"
import { interpret } from "xstate"
import { done } from "xstate/lib/actions"

const handshake = jest.fn(mockIdentityClientAuthEvent)
const getAppMeta = jest.fn(async () => ({
  name: "",
  logo: ""
}))

const testMachine = IDPMachine.withConfig({
  services: {
    async handshake() {
      const r = handshake()
      return {
        maxTimeToLive: r.maxTimeToLive,
        sessionPublicKey: r.sessionPublicKey,
        hostname: "test.com",
      }
    },
    getAppMeta,
  },
}).withContext({})

describe("IDP coordinator", () => {
  const { container } = render(<IDPCoordinator machine={testMachine} />)

  it("posts ready message upon initialization", () => {
    expect(handshake.mock.calls.length).toBe(1)
  })

  it("retrieves requesting app meta upon initialization", () => {
    expect(getAppMeta.mock.calls.length).toBe(1)
  })

  describe("authentication", () => {

    it("invokes authentication machine after initialization", (done) => {
      interpret(testMachine).onTransition((state) => {
        if (state.matches("AuthenticationMachine")) {
          expect(state.matches("AuthenticationMachine")).toBeTruthy()
          done()
        }
      }).start()
    })

    it("invokes authentication machine with correct ontext", (done) => {
      interpret(testMachine).onTransition((state) => {
        if (state.matches("AuthenticationMachine")) {
          const context = state.children.authenticate.getSnapshot().context
          expect(Object.keys(context)).toContain("appMeta")
          expect(Object.keys(context)).toContain("authRequest")
          done()
        }
      }).start()
    })
  })

  // describe("authentication", () => {
  //   describe("known device authentication", () => {
  //     it("renders known device flow when local device data is available", () => {})

  //     it("returns sign identity to parent upon completion", () => {})
  //   })

  //   describe("unknown device authentication", () => {
  //     it("renders unknown device flow when no local device data exists", () => {})

  //     describe("google authentication", () => {
  //       it("opens google oauth window when user selects sign in with google", () => {})

  //       it("assigns jwt on google callback and calls signin lambda", () => {})

  //       it("invokes registration flow if no google account existed", () => {})

  //       it("does not invoke registration flow if google account already exists", () => {})

  //       it("returns a sign identity back to parent machine upon completion", () => {})
  //     })

  //     describe("remote device authentication", () => {
  //       it("navigates to remote device authentication flow", () => {})

  //       it("displays qr code with secret channel for remote device", () => {})

  //       it("polls pubsub channel for messages", () => {})

  //       it("displays loading indicator when it receives mobile is preparing message", () => {})

  //       it("receives sign identity/delegate from pubsub channel", () => {})

  //       it("returns sign identity to parent upon completion", () => {})
  //     })

  //     describe("existing anchor authentication", () => {
  //       it("navigates to existing anchor authentication flow", () => {})

  //       // TODO: more detail here?

  //       it("navigates back to unknown device flow", () => {})

  //       it("returns sign identity to parent upon completion", () => {})
  //     })

  //     it("returns sign identity to parent upon completion", () => {})
  //   })
  // })

  // describe("authorization", () => {
  //   // TODO: more detail

  //   it("does not require unlock when provided with a sign identity", () => {})

  //   it("requires unlock when not provided with a sign identity", () => {})
  // })

  // describe("registration", () => {
  //   // TODO: probably in another module
  // })

  // it("posts delegation upon completion", () => {})
})
