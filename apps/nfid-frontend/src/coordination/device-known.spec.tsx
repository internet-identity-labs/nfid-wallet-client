/**
 * @jest-environment jsdom
 */
import { DelegationChain } from "@dfinity/identity"
import { render, waitFor, screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"

import { Profile } from "@nfid/integration"

import * as IM from "frontend/integration/identity-manager"
import { factoryProfile } from "frontend/integration/identity-manager/__mocks"
import { MultiWebAuthnIdentity } from "frontend/integration/identity/multiWebAuthnIdentity"
import * as II from "frontend/integration/internet-identity"
import { AUTHENTICATOR_DEVICES } from "frontend/integration/internet-identity/__mocks"
import KnownDeviceMachine, {
  KnownDeviceMachineContext,
  KnownDeviceActor,
} from "frontend/state/machines/authentication/known-device"

import { KnownDeviceCoordinator } from "./device-known"
import { makeInvokedActor } from "./test-utils"

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
          anchor: 11111,
        } as Profile,
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
          anchor: 11111,
          name: "The Dude",
        } as Profile,
        hostNameMock: "https://my-application.com",
        fetchApplicationsMock: [
          { accountLimit: 1, domain: "https://my-application.com" },
        ],
        isNFID: true,
      },
    ]
    NFID_TEST_PLAN.map((plan) => {
      it(plan.description, async () => {
        const mockLocalStorage = {
          ...window.localStorage,
          getItem: () =>
            JSON.stringify({ ...factoryProfile(), ...plan.profile }),
        }
        jest
          .spyOn(window, "localStorage", "get")
          .mockImplementation(() => mockLocalStorage)
        // @ts-ignore
        II.lookup = jest.fn(() => Promise.resolve([]))
        // @ts-ignore
        IM.fetchApplications = jest.fn(() =>
          Promise.resolve(plan.fetchApplicationsMock),
        )

        const context = {
          profile: plan.profile,
          isNFID: plan.isNFID,
          appMeta: {
            name: "MyApp",
            logo: "https://my-app.com/logo.svg",
          },
          authRequest: {
            maxTimeToLive: BigInt(10),
            sessionPublicKey: new Uint8Array([]),
            hostname: plan.hostNameMock,
          },
        }
        const actor = makeInvokedActor<KnownDeviceMachineContext>(
          KnownDeviceMachine,
          context,
        )
        render(<KnownDeviceCoordinator actor={actor as KnownDeviceActor} />)
        await waitFor(() => {
          plan.detectOnScreen.map((ele) => screen.getByText(ele))
        })
        expect(IM.fetchApplications).toHaveBeenCalledWith()
        expect(II.lookup).toHaveBeenCalledWith(11111, expect.any(Function))
      })
    })
  })
  describe("3rd Party App Auth State rendering", () => {
    const RENDER_AUTH_STATE_TEST_PLAN = [
      {
        description: "should render MultiAccount Authentication state",
        detectOnScreen: ["Unlock your NFID"],
        hostNameMock: "https://my-application.com",
        fetchApplicationsMock: [],
        profile: {
          anchor: 11111,
        } as Profile,
      },
      {
        description: "should render SingleAccount Authentication state",
        detectOnScreen: ["Unlock your NFID"],
        hostNameMock: "https://my-application.com",
        fetchApplicationsMock: [
          { accountLimit: 1, domain: "https://my-application.com" },
        ],
        profile: {
          anchor: 11111,
        } as Profile,
      },
    ]
    RENDER_AUTH_STATE_TEST_PLAN.map((plan) => {
      it(plan.description, async () => {
        const mockLocalStorage = {
          ...window.localStorage,
          getItem: () =>
            JSON.stringify({ ...factoryProfile(), ...plan.profile }),
        }
        jest
          .spyOn(window, "localStorage", "get")
          .mockImplementation(() => mockLocalStorage)
        // @ts-ignore
        II.lookup = jest.fn(() => Promise.resolve([]))
        // @ts-ignore
        IM.fetchApplications = jest.fn(() =>
          Promise.resolve(plan.fetchApplicationsMock),
        )

        const context = {
          profile: {
            anchor: 11111,
          } as Profile,
          isNFID: true,
          appMeta: {
            name: "MyApp",
            logo: "https://my-app.com/logo.svg",
          },
          authRequest: {
            maxTimeToLive: BigInt(10),
            sessionPublicKey: new Uint8Array([]),
            hostname: plan.hostNameMock,
          },
        }

        const actor = makeInvokedActor<KnownDeviceMachineContext>(
          KnownDeviceMachine,
          context,
        )

        render(<KnownDeviceCoordinator actor={actor as KnownDeviceActor} />)

        await waitFor(() => {
          plan.detectOnScreen.map((ele) => screen.getByText(ele))
        })
        expect(IM.fetchApplications).toHaveBeenCalledWith()
        expect(II.lookup).toHaveBeenCalledWith(11111, expect.any(Function))
      })
    })
  })
  describe("Authsession output", () => {
    const AUTH_SESSION_TEST_PLAN = [
      {
        description:
          "NFID Account should produce an authSession when user clicks unlock",
        detectOnScreen: ["Unlock as 11111"],
        unlockTarget: "Unlock as 11111",
        lookupMock: AUTHENTICATOR_DEVICES,
        hostNameMock: "https://my-application.com",
        fetchApplicationsMock: [],
        isNFID: true,
        profile: {
          anchor: 11111,
        } as Profile,
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
            anchor: 11111,
          } as Profile,
          isNFID: plan.isNFID,
          appMeta: {
            name: "MyApp",
            logo: "https://my-app.com/logo.svg",
          },
          authRequest: {
            maxTimeToLive: BigInt(10),
            sessionPublicKey: new Uint8Array([]),
            hostname: plan.hostNameMock,
          },
        }

        const actor = makeInvokedActor<KnownDeviceMachineContext>(
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
        await screen.findAllByAltText("loader")
        expect(DelegationChain.create).toHaveBeenCalled()
      })
    })
  })
})
