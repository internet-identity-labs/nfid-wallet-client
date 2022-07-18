/**
 * @jest-environment jsdom
 */
import { render, waitFor, screen } from "@testing-library/react"

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
  it("should render Authenticate state", async () => {
    // @ts-ignore
    II.lookup = jest.fn()
    // @ts-ignore
    IM.fetchApplications = jest.fn()

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
    await waitFor(() => screen.getByText("Authenticate"))
    expect(screen.getByText("Authenticate")).toBeDefined()
    expect(II.lookup).toHaveBeenCalledWith(11111, false)
    expect(IM.fetchApplications).toHaveBeenCalledWith()
  })
})
