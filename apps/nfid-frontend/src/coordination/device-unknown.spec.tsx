/**
 * @jest-environment jsdom
 */
import { MobileBrowser } from "@nfid/config"
import {
  fetchWebAuthnPlatformCapability,
  getIsMobileDeviceMatch,
  pubsub,
} from "@nfid/integration"
import { act, render, screen, waitFor } from "@testing-library/react"
import QR from "qrcode"

import UnknownDeviceMachine, {
  UnknownDeviceActor,
  UnknownDeviceContext,
} from "frontend/state/machines/authentication/unknown-device"

import { UnknownDeviceCoordinator } from "./device-unknown"
import { makeInvokedActor } from "./test-utils"

jest.mock("@nfid/integration")

const setupCoordinator = async (
  isMobile: boolean,
  WebAuthNCapability: boolean,
) => {
  ;(fetchWebAuthnPlatformCapability as jest.Mock).mockImplementation(() =>
    Promise.resolve(WebAuthNCapability),
  )
  ;(getIsMobileDeviceMatch as jest.Mock).mockImplementation(() => isMobile)

  const actor = makeInvokedActor<UnknownDeviceContext>(UnknownDeviceMachine, {
    appMeta: {
      name: "MyApp",
      logo: "https://my-app.com/logo.svg",
    },
    authRequest: {
      maxTimeToLive: BigInt(10),
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
    it.each(["DesktopBrowser", ...MobileBrowser])(
      "should render AuthSelection when on %s",
      async () => {
        await setupCoordinator(false, false)

        await waitFor(() => {
          screen.getByText("Choose how you'd like to sign in to MyApp")
          screen.getByText("Use passkey from a device with a camera")
        })

        expect(fetchWebAuthnPlatformCapability).toHaveBeenCalled()
      },
    )
    it.each(["DesktopBrowser", ...MobileBrowser])(
      "should render RemoteAuthentication on %s and query for messages",
      async (userAgent) => {
        await setupCoordinator(false, false)

        await waitFor(() => {
          screen.getByText("Use passkey from a device with a camera")
        })

        QR.toCanvas = jest.fn()

        act(() => {
          screen.getByText("Use passkey from a device with a camera").click()
        })

        await waitFor(() => {
          screen.getByText(
            "Scan this code from a device with a camera to sign in to MyApp",
          )
        })

        expect(QR.toCanvas).toHaveBeenCalledWith(
          expect.anything(),
          expect.stringContaining("http://localhost/ridp/?"),
          { width: 192 },
          expect.anything(),
        )
        expect(pubsub.get_messages).toHaveBeenCalled()
      },
    )
  })
  describe("Mobile with WebAuthN support", () => {
    it.each(MobileBrowser.map<[string, boolean]>((b) => [b, true]))(
      "should render RegistrationMachine on Mobile %s",
      async (_, hasWebAuthN) => {
        await setupCoordinator(true, hasWebAuthN)

        await waitFor(() => {
          screen.getByText("Choose how you'd like to sign in to MyApp")
          screen.getByText("Continue with enhanced security")
        })

        expect(fetchWebAuthnPlatformCapability).toHaveBeenCalled()
      },
    )
  })
})
