/**
 * @jest-environment jsdom
 */
import { DelegationChain } from "@dfinity/identity"
import { render, waitFor, screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"

import { MultiWebAuthnIdentity } from "frontend/integration/identity/multiWebAuthnIdentity"
import { AUTHENTICATOR_DEVICES } from "frontend/integration/internet-identity/__mocks"
import KnownDeviceMachine, {
  Context as KnownDeviceContext,
  KnownDeviceActor,
} from "frontend/state/machines/authentication/known-device"

import * as IM from "../../integration/identity-manager"
import * as II from "../../integration/internet-identity"
import { KnownDeviceCoordinator } from "../known-device"
import { makeInvokedActor } from "./_util"

describe("KnownDevice Coordinator", () => {
  const RENDER_AUTH_STATE_TEST_PLAN = [
    {
      description: "should render MultiAccount Authentication state",
      detectOnScreen: ["Choose an account", "to continue to MyApp"],
      hostNameMock: "https://my-application.com",
      fetchApplicationsMock: [],
    },
    {
      description: "should render SingleAccount Authentication state",
      detectOnScreen: ["Unlock NFID", "to continue to MyApp"],
      hostNameMock: "https://my-application.com",
      fetchApplicationsMock: [
        { accountLimit: 1, domain: "https://my-application.com" },
      ],
    },
  ]
  RENDER_AUTH_STATE_TEST_PLAN.map((plan) => {
    it(plan.description, async () => {
      // @ts-ignore
      II.lookup = jest.fn(() => Promise.resolve([]))
      // @ts-ignore
      IM.fetchApplications = jest.fn(() =>
        Promise.resolve(plan.fetchApplicationsMock),
      )

      const context = {
        anchor: 11111,
        isNFID: false,
        authAppMeta: {
          name: "MyApp",
          logo: "https://my-app.com/logo.svg",
        },
        authRequest: {
          maxTimeToLive: 10,
          sessionPublicKey: new Uint8Array([]),
          hostname: plan.hostNameMock,
        },
      }
      const actor = makeInvokedActor<KnownDeviceContext>(
        KnownDeviceMachine,
        context,
      )

      render(<KnownDeviceCoordinator actor={actor as KnownDeviceActor} />)
      await waitFor(() => {
        screen.getByText("Loading Configuration")
      })

      await waitFor(() => {
        plan.detectOnScreen.map((ele) => screen.getByText(ele))
        const appLogo = screen.getByAltText(
          `application-logo-${context.authAppMeta.name}`,
        )
        expect(appLogo.getAttribute("src")).toBe("https://my-app.com/logo.svg")
      })
      expect(IM.fetchApplications).toHaveBeenCalledWith()
      expect(II.lookup).toHaveBeenCalledWith(11111, false)
    })
  })

  const AUTH_SESSION_TEST_PLAN = [
    {
      description:
        "MultiAccount should produce an authSession when user clicks unlock",
      detectOnScreen: ["Choose an account", "to continue to MyApp"],
      unlockTarget: "Unlock NFID",
      lookupMock: AUTHENTICATOR_DEVICES,
      hostNameMock: "https://my-application.com",
      fetchApplicationsMock: [],
    },
    {
      description:
        "SingleAccount should produce an authSession when user clicks unlock",
      detectOnScreen: ["Unlock NFID", "to continue to MyApp"],
      unlockTarget: "Unlock to continue",
      lookupMock: AUTHENTICATOR_DEVICES,
      hostNameMock: "https://my-application.com",
      fetchApplicationsMock: [
        { accountLimit: 1, domain: "https://my-application.com" },
      ],
    },
  ]

  AUTH_SESSION_TEST_PLAN.map((plan) => {
    it(plan.description, async () => {
      // @ts-ignore
      II.lookup = jest.fn(() => Promise.resolve(plan.lookupMock))
      // @ts-ignore
      IM.fetchApplications = jest.fn(() =>
        Promise.resolve(plan.fetchApplicationsMock),
      )
      MultiWebAuthnIdentity.fromCredentials = jest.fn()
      DelegationChain.create = jest.fn()

      const context = {
        anchor: 11111,
        isNFID: false,
        authAppMeta: {
          name: "MyApp",
          logo: "https://my-app.com/logo.svg",
        },
        authRequest: {
          maxTimeToLive: 10,
          sessionPublicKey: new Uint8Array([]),
          hostname: plan.hostNameMock,
        },
      }

      const actor = makeInvokedActor<KnownDeviceContext>(
        KnownDeviceMachine,
        context,
      )
      render(<KnownDeviceCoordinator actor={actor as KnownDeviceActor} />)

      await waitFor(() => {
        screen.getByText("Loading Configuration")
      })

      await waitFor(() =>
        plan.detectOnScreen.map((ele) => screen.getByText(ele)),
      )

      act(() => {
        screen.getByText(plan.unlockTarget).click()
      })

      await waitFor(() => screen.getByText("End"))
      expect(MultiWebAuthnIdentity.fromCredentials).toHaveBeenCalledWith(
        [
          {
            credentialId: Buffer.from(AUTHENTICATOR_DEVICES[0].credentialId),
            pubkey: new ArrayBuffer(1),
          },
          {
            credentialId: Buffer.from(AUTHENTICATOR_DEVICES[1].credentialId),
            pubkey: new ArrayBuffer(1),
          },
        ],
        undefined,
      )
      expect(DelegationChain.create).toHaveBeenCalled()
    })
  })
})
