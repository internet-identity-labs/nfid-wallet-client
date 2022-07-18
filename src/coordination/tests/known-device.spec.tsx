/**
 * @jest-environment jsdom
 */
import { render, waitFor, screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"

import { AUTHENTICATOR_DEVICES } from "frontend/integration/internet-identity/__mocks"
import { AuthorizationRequest } from "frontend/state/authorization"
import KnownDeviceMachine, {
  Context as KnownDeviceContext,
  KnownDeviceActor,
} from "frontend/state/machines/authentication/known-device"

import * as IM from "../../integration/identity-manager"
import * as II from "../../integration/internet-identity"
import { KnownDeviceCoordinator } from "../known-device"
import { makeInvokedActor } from "./_util"

describe("KnownDevice Coordinator", () => {
  it("should render MultiAccount Authenticate state", async () => {
    // @ts-ignore
    II.lookup = jest.fn(() => Promise.resolve([]))
    // @ts-ignore
    IM.fetchApplications = jest.fn(() => Promise.resolve([]))

    const actor = makeInvokedActor<KnownDeviceContext>(KnownDeviceMachine, {
      anchor: 11111,
      isNFID: false,
      authRequest: {
        maxTimeToLive: 10,
        sessionPublicKey: new Uint8Array([]),
        hostname: "https://my-application.com",
      },
    })
    render(<KnownDeviceCoordinator actor={actor as KnownDeviceActor} />)
    await waitFor(() => screen.getByText("Authenticate MultiAccount"))
    expect(IM.fetchApplications).toHaveBeenCalledWith()
    expect(II.lookup).toHaveBeenCalledWith(11111, false)
  })

  it("should render SingleAccount Authenticate state", async () => {
    // @ts-ignore
    II.lookup = jest.fn(() => Promise.resolve([]))
    // @ts-ignore
    IM.fetchApplications = jest.fn(() =>
      Promise.resolve([
        { accountLimit: 1, domain: "https://my-application.com" },
      ]),
    )

    const actor = makeInvokedActor<KnownDeviceContext>(KnownDeviceMachine, {
      anchor: 11111,
      isNFID: false,
      authRequest: {
        maxTimeToLive: 10,
        sessionPublicKey: new Uint8Array([]),
        hostname: "https://my-application.com",
      },
    })
    render(<KnownDeviceCoordinator actor={actor as KnownDeviceActor} />)
    await waitFor(() => screen.getByText("Authenticate SingleAccount"))
    expect(IM.fetchApplications).toHaveBeenCalledWith()
    expect(II.lookup).toHaveBeenCalledWith(11111, false)
  })

  it.only("should produce an authSession when user clicks unlock", async () => {
    // @ts-ignore
    II.lookup = jest.fn(() => Promise.resolve(AUTHENTICATOR_DEVICES))
    // @ts-ignore
    IM.fetchApplications = jest.fn(() => Promise.resolve([]))

    const actor = makeInvokedActor<KnownDeviceContext>(KnownDeviceMachine, {
      anchor: 11111,
      isNFID: false,
      authRequest: {
        maxTimeToLive: 10,
        sessionPublicKey: new Uint8Array([]),
        hostname: "https://my-application.com",
      },
    })
    render(<KnownDeviceCoordinator actor={actor as KnownDeviceActor} />)
    await waitFor(() => screen.getByText("Login"))
    act(() => {
      screen.getByText("Login").click()
    })
  })
})
