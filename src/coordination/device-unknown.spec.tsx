/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react"

import * as device from "frontend/integration/device"
import UnknownDeviceMachine, {
  UnknownDeviceActor,
  UnknownDeviceContext,
} from "frontend/state/machines/authentication/unknown-device"

import { UnknownDeviceCoordinator } from "./device-unknown"
import { makeInvokedActor } from "./test-utils"

describe("Unknown Device Coordinator test suite", () => {
  it.each([["Android"]])(
    "should render AuthSelection when no WebAuthN support on %s",
    async (userAgent) => {
      // @ts-ignore
      global.navigator.userAgent = userAgent
      jest
        .spyOn(device, "fetchWebAuthnCapability")
        .mockImplementation(() => Promise.resolve(false))

      const actor = makeInvokedActor<UnknownDeviceContext>(
        UnknownDeviceMachine,
        {
          authAppMeta: {
            name: "MyApp",
            logo: "https://my-app.com/logo.svg",
          },
          authRequest: {
            maxTimeToLive: 10,
            sessionPublicKey: new Uint8Array([]),
            hostname: "myhost.com",
          },
        },
      )
      const { container } = render(
        <UnknownDeviceCoordinator actor={actor as UnknownDeviceActor} />,
      )

      await waitFor(() =>
        screen.getByText("Choose how you'd like to sign in to"),
      )

      expect(device.fetchWebAuthnCapability).toHaveBeenCalled()
    },
  )
})
