import { v4 as uuid } from "uuid"
import { ActorRefFrom, assign, createMachine } from "xstate"

import AuthWithIIMachine from "frontend/features/sign-in-options/machine"
import { isMobileWithWebAuthn } from "frontend/integration/device/services"
import { loginWithAnchor } from "frontend/integration/internet-identity/services"
import {
  AuthSession,
  LocalDeviceAuthSession,
  RemoteDeviceAuthSession,
} from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import AuthWithGoogleMachine from "./auth-with-google"
import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"

export interface UnknownDeviceContext {
  authRequest: AuthorizationRequest
  authSession?: AuthSession
  appMeta?: AuthorizingAppMeta
}

export type Events =
  | { type: "done.invoke.remote"; data?: RemoteDeviceAuthSession }
  | { type: "done.invoke.registration"; data?: AuthSession }
  | { type: "done.invoke.registerDevice"; data: AuthSession }
  | { type: "done.invoke.signInSameDevice"; data: LocalDeviceAuthSession }
  | { type: "done.invoke.isMobileWithWebAuthn"; data: boolean }
  | {
      type: "done.invoke.AuthWithGoogleMachine"
      data: AuthSession
    }
  | {
      type: "done.invoke.authWithII"
      data: AuthSession
    }
  | {
      type: "done.invoke.loginWithAnchor"
      data: AuthSession
    }
  | { type: "AUTH_WITH_GOOGLE"; data: { jwt: string } }
  | { type: "AUTH_WITH_REMOTE" }
  | { type: "AUTH_WITH_OTHER" }
  | { type: "AUTH_WITH_II" }
  | {
      type: "AUTH_WITH_EXISTING_ANCHOR"
      data: { anchor: number; withSecurityDevices?: boolean }
    }
  | { type: "END"; data: AuthSession }

export interface Schema {
  events: Events
  context: UnknownDeviceContext
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3SYGFMx6BHsgAOyAEa0ANrXQBPAMQRieZrTzViBNbACyxSVLAB1WZmNhxAQQyY8iUCOKxZtFQ5AAPRAEYATABsTACcABw+wQDMAAwALJEA7D4ArP6hADQgcoiRkX5MscHBCcGxyQnRoWEBsQC+tZloWLiEJOSUNAzMAEpgULSw6BzI6G54usj0mOpgSipqGlrMHH0DQyNjHk4uo+5IXojxQbEBoaGxftHB5akZWYjJoQlMydFvfjHnVQEJ9Y22LSIZAoVDojCYNiwLDARnouzwCisAFUACoACQA+sYAJLojEAcQA8oT8QAZACiW2crj2oG8CD8jwKiUKyT8fh8sROoWSmWyCFCkWCTDeosiPmiPh5AT8fxATRw+CB7VBXQhtmhsPhiNRmJxeO65N0hJRlP22xp9n29L8sVCzISrPZnO5fj5viuQVeb1eZT8xTqDXlAKVbRBnXBkMwmoE2uReP1mJNaPJ3SpO021sQgXt8Ud12dXNOvPuCASqSYPgC1ceCQCuQqkTlCsBYY6YOYUdMWHxxGIUCMc1UTHUmm06qw3cwvf7RgmUxm6ctHnpPh84qYkXKkXCkTt0T8CXdAsCTCSyTCoUue8qPmbIdawPbat6AFtiOgwFGwHhRvQNioQ4LGOyxgO+n5LvCK6IFekQhNEMrJAEt4lIUx4SsEXqir6bIBvezShk+qrguSnhrOoUBWHgUzEBwOoJriSboqmkGZnS2anA6TockWPLHo2lbVtWgqXLEdYBPhiqPiqEbMKR5F4JR1GYLR9F6oxGLkgAGtiLAotiABy+IYlYBk8GihJpua1JQVmCCnD4LxPPE5SeleR6lvWsRMO5fjhMUPxFMEkmtkRskTvwv4MCMYAsMgr5gAAIrJQEjos45SP26hTlRNEcKxtIHAgKQJPk64ROywSepKdz8jUjnBFKMp+SUAQRCFhEyR2EU-n+MVxQlyUdgoYAcBwtFMCIUgjAAZrRr5MJl-R4Dlym0QVVrscVlRwT8bxnFUeSVG6pYJEKZ4nJc4SxJK5QSXKJBUPA+wtp14bdWwnDcHwAhCKIEjSLI-KODZbFFaV6EciKoo1RUwnnB10nvWqn1cBt0EIHax52iEQWYaVdpiRUySI8qyPgr0-SDMM8LztMqjo3ZzVnj8JTJEK4rlD42MVEwh6RPWVYJKV1zJCTQavUjz6RhqMKxmDFq2VtnHRHD1xnaEbVRCWdUHkwyFCikpxRHu4v-ARUvEZ2thTjOA5gIzW2vMcxSJDuRTrkhx7XQUosnJhhsyqTbZW0wb4fl+ti9dFSsgIrYP0mUjkfHmKS2qcmvoQhyTQ28e7Xarh7B2F3XyYMFG5Sp+XWRmhX0my+QHoUh7xJrqQefyFTPDDUoxF5AvF11arflF-6fgNSWyY7RUSuyBTREh1xlK7W7HvW0QvFVvc7cksRSoP5NyXgEDT6u5y7ZrjrrjtKSRN75xnsEtqHVceQIxLD5k9LDs18udm2sebAc88ZVTFlud2A96i1CAA */
  createMachine(
    {
      tsTypes: {} as import("./unknown-device.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      id: "auth-unknown-device",
      initial: "Start",
      states: {
        Start: {
          initial: "CheckCapability",
          states: {
            CheckCapability: {
              invoke: {
                src: "isMobileWithWebAuthn",
                id: "isMobileWithWebAuthn",
                onDone: [
                  {
                    cond: "bool",
                    target: "#auth-unknown-device.RegistrationMachine",
                  },
                  {
                    target: "#auth-unknown-device.AuthSelection",
                  },
                ],
              },
            },
          },
        },
        RegistrationMachine: {
          invoke: {
            src: "RegistrationMachine",
            id: "registration",
            data: (context, event) => ({
              authSession: context.authSession,
              appMeta: context.appMeta,
            }),
            onDone: [
              {
                target: "End",
                actions: "assignAuthSession",
              },
            ],
          },
        },
        AuthSelection: {
          on: {
            AUTH_WITH_GOOGLE: {
              target: "AuthWithGoogle",
            },
            AUTH_WITH_REMOTE: {
              target: "RemoteAuthentication",
            },
            AUTH_WITH_OTHER: {
              target: "ExistingAnchor",
            },
            AUTH_WITH_II: {
              target: "IIAuthentication",
            },
          },
        },
        AuthWithGoogle: {
          invoke: {
            src: "AuthWithGoogleMachine",
            id: "AuthWithGoogleMachine",
            data: (_, event: { data: { jwt: string } }) => {
              return { jwt: event.data.jwt }
            },
            onDone: [
              {
                cond: "isExistingAccount",
                actions: "assignAuthSession",
                target: "End",
              },
              {
                actions: "assignAuthSession",
                target: "RegistrationMachine",
              },
            ],
          },
        },
        IIAuthentication: {
          invoke: {
            src: "AuthWithIIMachine",
            id: "authWithII",
            data: (context, _) => ({
              authRequest: context.authRequest,
              appMeta: context.appMeta,
            }),
            onDone: [
              { cond: "isReturn", target: "AuthSelection" },
              {
                cond: "isExistingAccount",
                actions: "assignAuthSession",
                target: "End",
              },
              {
                actions: "assignAuthSession",
                target: "RegistrationMachine",
              },
            ],
          },
        },
        RemoteAuthentication: {
          invoke: {
            src: "RemoteReceiverMachine",
            id: "remote",
            data: (context, _) => ({
              secret: uuid(),
              authRequest: context.authRequest,
              appMeta: context.appMeta,
            }),
            onDone: [
              {
                cond: "bool",
                target: "End",
                actions: "assignAuthSession",
              },
              {
                target: "AuthSelection",
              },
            ],
          },
        },
        ExistingAnchor: {
          on: {
            AUTH_WITH_OTHER: {
              target: "AuthSelection",
            },
            AUTH_WITH_EXISTING_ANCHOR: {
              target: "AuthenticateSameDevice",
            },
          },
        },
        AuthenticateSameDevice: {
          invoke: {
            src: "loginWithAnchor",
            id: "loginWithAnchor",
            onDone: [
              {
                target: "End",
                actions: "assignAuthSession",
              },
            ],
            onError: [
              {
                target: "ExistingAnchor",
              },
            ],
          },
        },
        End: {
          type: "final",
          data: (context, event) => {
            console.debug("UnknownDeviceMachine End", {
              authSession: context.authSession,
              context,
              event,
            })
            return context.authSession
          },
        },
      },
    },
    {
      guards: {
        isExistingAccount: (context, event) => {
          return !!event?.data?.anchor
        },
        bool: (context, event) => !!event.data,
        isReturn: (context, event) => !event.data,
      },
      actions: {
        assignAuthSession: assign({
          authSession: (_, event) => {
            console.debug("UnknownDeviceMachine assignAuthSession", { event })
            return event.data
          },
        }),
      },
      services: {
        isMobileWithWebAuthn,
        RegistrationMachine,
        RemoteReceiverMachine,
        loginWithAnchor,
        AuthWithGoogleMachine,
        AuthWithIIMachine,
      },
    },
  )

export type UnknownDeviceActor = ActorRefFrom<typeof UnknownDeviceMachine>
export default UnknownDeviceMachine
