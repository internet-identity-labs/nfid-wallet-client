/**
 * @jest-environment jsdom
 */
import { act, render, screen, waitFor } from "@testing-library/react"
import QR from "qrcode"

import { ii } from "frontend/integration/actors"
import * as device from "frontend/integration/device"
import UnknownDeviceMachine, {
  UnknownDeviceActor,
  UnknownDeviceContext,
} from "frontend/state/machines/authentication/unknown-device"

import { UnknownDeviceCoordinator } from "./device-unknown"
import { makeInvokedActor } from "./test-utils"

const setupCoordinator = (userAgent: string, WebAuthNCapability: boolean) => {
  // @ts-ignore
  global.navigator.userAgent = userAgent
  jest
    .spyOn(device, "fetchWebAuthnCapability")
    .mockImplementation(() => Promise.resolve(WebAuthNCapability))
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

describe("UnknownDeviceCoordinator", () => {
  describe("Desktop or no support for WebAuthN", () => {
    it.each(["DesktopBrowser", ...device.MobileBrowser])(
      "should render AuthSelection when on %s",
      async (userAgent) => {
        setupCoordinator(userAgent, false)

        await waitFor(() => {
          screen.getByText("Choose how you'd like to sign in to MyApp")
          screen.getByText("Use passkey from a device with a camera")
        })

        expect(device.fetchWebAuthnCapability).toHaveBeenCalled()
      },
    )
    it.each(["DesktopBrowser", ...device.MobileBrowser])(
      "should render RemoteAuthentication on %s",
      async (userAgent) => {
        setupCoordinator(userAgent, false)

        await waitFor(() => {
          screen.getByText("Use passkey from a device with a camera")
        })

        QR.toCanvas = jest.fn()

        act(() => {
          screen.getByText("Use passkey from a device with a camera").click()
        })

        expect(QR.toCanvas).toHaveBeenCalledWith(
          expect.anything(),
          "http://localhost/remote-idp?applicationName=MyApp&applicationLogo=https%253A%252F%252Fmy-app.com%252Flogo.svg",
          { width: 192 },
          expect.anything(),
        )
      },
    )
  })
  describe("Mobile with WebAuthN support", () => {
    it.each(device.MobileBrowser.map<[string, boolean]>((b) => [b, true]))(
      "should render RegistrationMachine on Mobile %s",
      async (userAgent, hasWebAuthN) => {
        // @ts-ignore
        ii.create_challenge = jest.fn(() =>
          Promise.resolve({
            png_base64: "R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
            challenge_key: "challenge_key",
          }),
        )

        setupCoordinator(userAgent, hasWebAuthN)

        await waitFor(() => {
          screen.getByText("Choose how you'd like to sign in to MyApp")
          screen.getByText("Create a new NFID")
        })

        expect(device.fetchWebAuthnCapability).toHaveBeenCalled()
      },
    )
  })
})
