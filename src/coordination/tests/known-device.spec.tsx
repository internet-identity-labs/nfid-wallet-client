/**
 * @jest-environment jsdom
 */
import { DelegationChain } from "@dfinity/identity"
import { render, waitFor, screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"

import { MultiWebAuthnIdentity } from "frontend/integration/identity/multiWebAuthnIdentity"
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
  const RENDER_AUTH_STATE_TEST_PLAN = [
    {
      description: "should render MultiAccount Authentication state",
      screenDetector: "Choose an account",
      hostNameMock: "https://my-application.com",
      fetchApplicationsMock: [],
    },
    {
      description: "should render SingleAccount Authentication state",
      screenDetector: "Unlock NFID",
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

      const actor = makeInvokedActor<KnownDeviceContext>(KnownDeviceMachine, {
        anchor: 11111,
        isNFID: false,
        authRequest: {
          maxTimeToLive: 10,
          sessionPublicKey: new Uint8Array([]),
          hostname: plan.hostNameMock,
        },
      })

      render(<KnownDeviceCoordinator actor={actor as KnownDeviceActor} />)
      await waitFor(() => {
        screen.getByText("Loading Configuration")
      })

      await waitFor(() => {
        screen.getByText("Sign in with NFID")
        screen.getByText(plan.screenDetector)
      })
      expect(IM.fetchApplications).toHaveBeenCalledWith()
      expect(II.lookup).toHaveBeenCalledWith(11111, false)
    })
  })

  const AUTH_SESSION_TEST_PLAN = [
    {
      description: "should produce an authSession when user clicks unlock",
      screenDetector: "Unlock NFID",
      lookupMock: AUTHENTICATOR_DEVICES,
      hostNameMock: "https://my-application.com",
      fetchApplicationsMock: [],
    },
    // {
    //   description: "should render SingleAccount Authentication state",
    //   screenDetector: "Unlock NFID",
    //   hostNameMock: "https://my-application.com",
    //   fetchApplicationsMock: [
    //     { accountLimit: 1, domain: "https://my-application.com" },
    //   ],
    // },
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

      const actor = makeInvokedActor<KnownDeviceContext>(KnownDeviceMachine, {
        anchor: 11111,
        isNFID: false,
        authRequest: {
          maxTimeToLive: 10,
          sessionPublicKey: new Uint8Array([]),
          hostname: plan.hostNameMock,
        },
      })
      render(<KnownDeviceCoordinator actor={actor as KnownDeviceActor} />)

      await waitFor(() => {
        screen.getByText("Loading Configuration")
      })

      await waitFor(() => screen.getByText(plan.screenDetector))
      act(() => {
        screen.getByText(plan.screenDetector).click()
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
