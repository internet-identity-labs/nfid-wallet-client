/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react"

import { ii } from "frontend/integration/actors"
import * as device from "frontend/integration/device"
import UnknownDeviceMachine, {
  UnknownDeviceActor,
  UnknownDeviceContext,
} from "frontend/state/machines/authentication/unknown-device"

import { UnknownDeviceCoordinator } from "./device-unknown"
import { makeInvokedActor } from "./test-utils"

const setupCoordinator = () => {
  const actor = makeInvokedActor<UnknownDeviceContext>(UnknownDeviceMachine, {
    appMeta: {
      name: "MyApp",
      logo: "https://my-app.com/logo.svg",
    },
    authRequest: {
      maxTimeToLive: 10,
      sessionPublicKey: new Uint8Array([]),
      hostname: "myhost.com",
    },
  })
  return render(
    <UnknownDeviceCoordinator actor={actor as UnknownDeviceActor} />,
  )
}

describe("Unknown Device Coordinator test suite", () => {
  it.each(["DesktopBrowser", ...device.MobileBrowser])(
    "should render AuthSelection when on %(userAgent)s without WebAuthN Support",
    async (userAgent) => {
      // @ts-ignore
      global.navigator.userAgent = userAgent
      jest
        .spyOn(device, "fetchWebAuthnCapability")
        .mockImplementation(() => Promise.resolve(false))

      setupCoordinator()

      await waitFor(() => {
        screen.getByText("Choose how you'd like to sign in to MyApp")
        screen.getByText("Use passkey from a device with a camera")
      })

      expect(device.fetchWebAuthnCapability).toHaveBeenCalled()
    },
  )
  it.each(device.MobileBrowser.map<[string, boolean]>((b) => [b, true]))(
    "should render RegistrationMachine on Mobile and WebAuthN capability %s",
    async (userAgent, hasWebAuthN) => {
      // @ts-ignore
      window.navigator.userAgent = userAgent

      // @ts-ignore
      ii.create_challenge = jest.fn(() =>
        Promise.resolve({
          png_base64: "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
          challenge_key: "challenge_key",
        }),
      )
      jest
        .spyOn(device, "fetchWebAuthnCapability")
        // TODO: Add device list with WebAuthN capability
        .mockImplementation(() => Promise.resolve(hasWebAuthN))

      setupCoordinator()

      await waitFor(() => {
        screen.getByText("Choose how you'd like to sign in to MyApp")
        screen.getByText("Create a new NFID")
      })

      expect(device.fetchWebAuthnCapability).toHaveBeenCalled()
    },
  )
})
