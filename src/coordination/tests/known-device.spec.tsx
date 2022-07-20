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
  describe("NFID Auth State rendering", () => {
    const NFID_TEST_PLAN = [
      {
        description:
          "should render un-personalisation NFID Authentication state",
        detectOnScreen: [
          "Unlock your NFID",
          "The NFID on this device can only be unlocked by 11111.",
          "Unlock as 11111",
        ],
        hostNameMock: "https://my-application.com",
        profile: {
          anchor: "11111",
        },
        fetchApplicationsMock: [
          { accountLimit: 1, domain: "https://my-application.com" },
        ],
        isNFID: true,
      },
      {
        description: "should render personalisation NFID Authentication state",
        detectOnScreen: [
          "Unlock your NFID",
          "The NFID on this device can only be unlocked by The Dude.",
          "Unlock as The Dude",
        ],
        profile: {
          anchor: "11111",
          name: "The Dude",
        },
        hostNameMock: "https://my-application.com",
        fetchApplicationsMock: [
          { accountLimit: 1, domain: "https://my-application.com" },
        ],
        isNFID: true,
      },
    ]
    NFID_TEST_PLAN.map((plan) => {
      it(plan.description, async () => {
        // @ts-ignore
        II.lookup = jest.fn(() => Promise.resolve([]))
        // @ts-ignore
        IM.fetchApplications = jest.fn(() =>
          Promise.resolve(plan.fetchApplicationsMock),
        )

        const context = {
          profile: plan.profile,
          isNFID: plan.isNFID,
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
          plan.detectOnScreen.map((ele) => screen.getByText(ele))
        })
        expect(IM.fetchApplications).toHaveBeenCalledWith()
        expect(II.lookup).toHaveBeenCalledWith(11111, false)
      })
    })
  })
  describe("3rd Party App Auth State rendering", () => {
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
          profile: {
            anchor: "11111",
          },
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
          plan.detectOnScreen.map((ele) => screen.getByText(ele))
          const appLogo = screen.getByAltText(
            `application-logo-${context.authAppMeta.name}`,
          )
          expect(appLogo.getAttribute("src")).toBe(
            "https://my-app.com/logo.svg",
          )
        })
        expect(IM.fetchApplications).toHaveBeenCalledWith()
        expect(II.lookup).toHaveBeenCalledWith(11111, false)
      })
    })
  })
  describe("Authsession output", () => {
    const AUTH_SESSION_TEST_PLAN = [
      {
        description:
          "NFID Account should produce an authSession when user clicks unlock",
        detectOnScreen: ["Unlock your NFID"],
        unlockTarget: "Unlock as 11111",
        lookupMock: AUTHENTICATOR_DEVICES,
        hostNameMock: "https://my-application.com",
        fetchApplicationsMock: [],
        isNFID: true,
      },
      {
        description:
          "MultiAccount should produce an authSession when user clicks unlock",
        detectOnScreen: ["Choose an account", "to continue to MyApp"],
        unlockTarget: "Unlock NFID",
        lookupMock: AUTHENTICATOR_DEVICES,
        hostNameMock: "https://my-application.com",
        fetchApplicationsMock: [],
        isNFID: false,
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
        isNFID: false,
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
          profile: {
            anchor: "11111",
          },
          isNFID: plan.isNFID,
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
})
