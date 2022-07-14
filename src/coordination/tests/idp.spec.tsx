/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { render, fireEvent, waitFor, screen, act } from "@testing-library/react"
import React from "react"

import { mockIdentityClientAuthEvent } from "frontend/integration/windows/__mock"
import IDPMachine from "frontend/state/machines/authorization/idp"

import IDPCoordinator from "../idp"

const handshake = jest.fn(mockIdentityClientAuthEvent)
const isDeviceRegisteredFalse = jest.fn(() => false)
const isDeviceRegisteredTrue = jest.fn(() => false)

const testMachine = IDPMachine.withConfig({
  services: {
    async handshake() {
      const r = handshake()
      return {
        maxTimeToLive: Number(r.maxTimeToLive),
        sessionPublicKey: r.sessionPublicKey,
        hostname: "test.com",
      }
    },
  },
})

describe("IDP coordinator", () => {
  it("posts ready message upon initialization", () => {
    render(<IDPCoordinator machine={testMachine} />)
    expect(handshake.mock.calls.length).toBe(1)
  })

  describe("authentication", () => {
    describe("known device authentication", () => {
      it("renders known device flow when local device data is available", () => {})

      it("returns sign identity to parent upon completion", () => {})
    })

    describe("unknown device authentication", () => {
      it("renders unknown device flow when no local device data exists", () => {})

      describe("google authentication", () => {
        it("opens google oauth window when user selects sign in with google", () => {})

        it("ingests jwt on google callback and calls signin lambda", () => {})

        it("invokes registration flow if no google account existed", () => {})

        it("does not invoke registration flow if google account already exists", () => {})

        it("returns a sign identity back to parent machine upon completion", () => {})
      })

      describe("remote device authentication", () => {
        it("navigates to remote device authentication flow", () => {})

        it("displays qr code with secret channel for remote device", () => {})

        it("polls pubsub channel for messages", () => {})

        it("displays loading indicator when it receives mobile is preparing message", () => {})

        it("receives sign identity/delegate from pubsub channel", () => {})

        it("returns sign identity to parent upon completion", () => {})
      })

      describe("existing anchor authentication", () => {
        it("navigates to existing anchor authentication flow", () => {})

        // TODO: more detail here?

        it("navigates back to unknown device flow", () => {})

        it("returns sign identity to parent upon completion", () => {})
      })

      it("returns sign identity to parent upon completion", () => {})
    })
  })

  describe("authorization", () => {
    // TODO: more detail

    it("does not require unlock when provided with a sign identity", () => {})

    it("requires unlock when not provided with a sign identity", () => {})
  })

  describe("registration", () => {
    // TODO: probably in another module
  })

  it("posts delegation upon completion", () => {})
})
