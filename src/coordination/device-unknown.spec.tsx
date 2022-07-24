/**
 * @jest-environment jsdom
 */
import { act, render, screen, waitFor } from "@testing-library/react"
import QR from "qrcode"

import { ii, pubsub } from "frontend/integration/actors"
import { iiCreateChallengeMock } from "frontend/integration/actors.mocks"
import * as device from "frontend/integration/device"
import { AUTHENTICATOR_DEVICES } from "frontend/integration/internet-identity/__mocks"
import { WAIT_FOR_CONFIRMATION_MESSAGE } from "frontend/integration/pubsub"
import { REMOTE_LOGIN_REGISTER_MESSAGE } from "frontend/integration/pubsub/__mocks"
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
      "should render RemoteAuthentication on %s and query for messages",
      async (userAgent) => {
        setupCoordinator(userAgent, false)

        await waitFor(() => {
          screen.getByText("Use passkey from a device with a camera")
        })

        QR.toCanvas = jest.fn()

        pubsub.get_messages = jest.fn()

        act(() => {
          screen.getByText("Use passkey from a device with a camera").click()
        })

        await waitFor(() => {
          screen.getByText(
            "Use passkey from a device with a camera to sign in to MyApp",
          )
        })

        expect(QR.toCanvas).toHaveBeenCalledWith(
          expect.anything(),
          "http://localhost/ridp?applicationName=MyApp&applicationLogo=https%253A%252F%252Fmy-app.com%252Flogo.svg",
          { width: 192 },
          expect.anything(),
        )
        expect(pubsub.get_messages).toHaveBeenCalled()
      },
    )
    it("should render loading state when receiving await confirmation messages", async () => {
      setupCoordinator("DesktopBrowser", false)
      await waitFor(() => {
        screen.getByText("Use passkey from a device with a camera")
      })
      QR.toCanvas = jest.fn()
      pubsub.get_messages = jest.fn(() =>
        Promise.resolve({
          body: [[JSON.stringify(WAIT_FOR_CONFIRMATION_MESSAGE)]],
          error: [],
          status_code: 200,
        }),
      )

      act(() => {
        screen.getByText("Use passkey from a device with a camera").click()
      })
      await waitFor(() => {
        screen.getByText("Waiting for verification on mobile...")
      })
    })
    it("should render TrustDevice state when receiving register messages", async () => {
      setupCoordinator("DesktopBrowser", false)
      await waitFor(() => {
        screen.getByText("Use passkey from a device with a camera")
      })
      QR.toCanvas = jest.fn()
      pubsub.get_messages = jest.fn(() =>
        Promise.resolve({
          body: [[JSON.stringify(REMOTE_LOGIN_REGISTER_MESSAGE)]],
          error: [],
          status_code: 200,
        }),
      )
      // @ts-ignore FIXME: some mock configuration missing
      ii.lookup = jest.fn(() => Promise.resolve(AUTHENTICATOR_DEVICES))

      act(() => {
        screen.getByText("Use passkey from a device with a camera").click()
      })
      await waitFor(() => {
        screen.getByText("TODO: TrustDevice")
      })
    })
  })
  describe("Mobile with WebAuthN support", () => {
    it.each(device.MobileBrowser.map<[string, boolean]>((b) => [b, true]))(
      "should render RegistrationMachine on Mobile %s",
      async (userAgent, hasWebAuthN) => {
        // @ts-ignore
        ii.create_challenge = jest.fn(iiCreateChallengeMock)

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
