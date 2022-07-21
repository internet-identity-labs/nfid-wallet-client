import { ActorRefFrom, assign, createMachine } from "xstate"
import { send } from "xstate/lib/actions"

import { RemoteDeviceAuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

export interface Context {
  secret: string
  authSession?: RemoteDeviceAuthSession
  authRequest?: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
}

export type Events = { type: "TRUST" } | { type: "DONT_TRUST" }

export const TrustDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgE5gFsB7dMPMAYzAEsA3MXAOgGUwAbS9AYgBUAlAKrMeiUAAcisaumpEAdqJAAPRAEYA7ABZGATgAMAZlUAmHQA4zRzZeMAaEAE9Ex9WcaaArADYDBzTtUzPXU9M3UAX3D7NCxyYlJyKjoGFnZOLgARAHkAOR4AfX4hESQQCSkZeUUVBA1tfSNTCysbeycETzcG1QCPMxc9F0jojBx8eLJ8JPomAElYAFkiACNqDgB1MGWAQVG5LkVy6VkFUpqPTWNGEKMLzWsPPU0DNucNdx0L1T1BvR11KzDEAxMaEEiTSg0GaMPhgKDUWCkXDraSYTY7PZcCDyMCMahyWhEADWuPw8MRDBRWHRuywp3EkmOVTOah6XkYPx093+5gBz1eCBcbk8Pj8ASCITCQJBcXBiShKVh5KRVMwrAoqFw0gcAGkwA4sTi8QTiaS4RVKaj1ZrtXr2gyKidqqydOzOdz1Ly-C9HGo-B89F5PAYuY9LF5IlEQHIiBA4IoZeM5VMFUxWBwKOhDozKvTlIhLgLjEFGF5VN9LsYPD1VJ4IlHE2CEinknNFis1mAaXts47maAagZjFcPOpHj0dCH7povEX1Fd7hcDD8DI8vJOIw3RrLm5DW4wAKJyCC9pl5mq1oOMDT9ZeaVRB9eaOcL4MhSd9T2aaXbpO76aKnCCIqqi3Z0qeubOggnpuiYHijqYPgeAYs6+oK-qfJO+hmIE5jrj+sR-hCAFMEqwGWlg1paugur6hBTostBrocnBCGuquKECvouiTuoSF6I85iBgRoITPKrb0f2+a1GYAqBJG4RAA */
  createMachine(
    {
      tsTypes: {} as import("./trust-device.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "auth-trust-device",
      initial: "Select",
      states: {
        Select: {
          on: {
            TRUST: {
              target: "IsMobileWebAuthn",
            },
            DONT_TRUST: {
              target: "End",
            },
          },
        },
        IsMobileWebAuthn: {
          always: [
            {
              cond: "isMobileWebAuthn",
              target: "RegisterWithWebAuthn",
            },
            {
              target: "RegisterWithSecurityKey",
            },
          ],
        },
        End: {
          type: "final",
        },
        RegisterWithWebAuthn: {
          invoke: {
            src: "registerWithWebAuthn",
            id: "registerWithWebAuthn",
            onDone: [
              {
                target: "End",
              },
            ],
          },
        },
        RegisterWithSecurityKey: {
          invoke: {
            src: "registerWithSecurityKey",
            id: "regsiterWithSecurityKey",
            onDone: [
              {
                target: "End",
              },
            ],
          },
        },
      },
    },
    {},
  )

export type RemoteReceiverActor = ActorRefFrom<typeof RemoteReceiverMachine>

export default RemoteReceiverMachine
