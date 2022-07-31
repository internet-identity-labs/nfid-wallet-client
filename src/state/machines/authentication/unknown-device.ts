import { v4 as uuid } from "uuid"
import { ActorRefFrom, assign, createMachine } from "xstate"

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

import AuthWithGoogleMachine, {
  AuthWithGoogleMachineContext,
} from "./auth-with-google"
import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"

export interface UnknownDeviceContext {
  authRequest: AuthorizationRequest
  authSession?: AuthSession
  appMeta?: AuthorizingAppMeta
}

export type Events =
  | { type: "done.invoke.remote"; data: RemoteDeviceAuthSession }
  | { type: "done.invoke.registration"; data: AuthSession }
  | { type: "done.invoke.registerDevice"; data: AuthSession }
  | { type: "done.invoke.signInSameDevice"; data: LocalDeviceAuthSession }
  | { type: "done.invoke.isMobileWithWebAuthn"; data: boolean }
  | {
      type: "done.invoke.AuthWithGoogleMachine"
      data: AuthWithGoogleMachineContext
    }
  | { type: "AUTH_WITH_GOOGLE"; data: { jwt: string } }
  | { type: "AUTH_WITH_REMOTE" }
  | { type: "AUTH_WITH_OTHER" }
  | {
      type: "AUTH_WITH_EXISTING_ANCHOR"
      data: { anchor: string; withSecurityDevices?: boolean }
    }
  | { type: "END"; data: AuthSession }

export interface Schema {
  events: Events
  context: UnknownDeviceContext
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3SYGFMx6BHsgAOyAEa0ANrXQBPAMQRieZrTzViBNbACyxSVLAB1WZmNhxAQQyY8iUCOKxZtFQ5AAPRAEYATABsTACcABw+wQDMAAwALJEA7D4ArP6hADQgcoiRkX5MscHBCcGxyQnRoWEBsQC+tZloWLiEJOSUNAzMAEpgULSw6BzI6G54usj0mOpgSipqGlrMHH0DQyNjHk4uo+5IXojxQbEBoaGxftHB5akZWYjJoQlMydFvfjHnVQEJ9Y22LSIZAoVDojCYNiwLDARnouzwCisAFUACoACQA+sYAJLojEAcQA8oT8QAZACiW2crj2oG8CD8jwKiUKyT8fh8sROoWSmWyCFCkWCTDeosiPmiPh5AT8fxATRw+CB7VBXQhtmhsPhiNRmJxeO65N0hJRlP22xp9n29L8sVCzISrPZnO5fj5viuQVeb1eZT8xTqDXlAKVbRBnXBkMwmoE2uReP1mJNaPJ3SpO021sQgXt8Ud12dXNOvPuCASqSYPgC1ceCQCuQqkTlCsBYY6YOYUdMWHxxGIUCMc1UTHUmm06qw3cwvf7RgmUxm6ctHnpEo5BViCQ5yVKRTesXdAolIVi+9iPir5d+QZboeB7bVvQAtsR0GAo2A8KN6BsVEOFmOyxgC+b5LvCK6IKEHwhNEMrJAElQ+CUhSHhKwReqKvpsgGzYhq096quC5KeGs6hQFYeBTMQHA6gmuJJuiqZgZmdLZqcDpOhyRY8oejaVtW1aCpcm7VrhzR3iqEbMMRpF4ORlGYNRtF6vRGLkgAGtiLAotiABy+IYlYuk8GihJpua1LgVmCCnD4LxPPE5SelBCSHvWsRMC5fjhMUPxFMEYmKvhkkdhO-BfgwIxgCwyBPmAAAiUn-iOizjlI-bqFOFFURwzG0gcCApFulbisE7LBJ6kp3PyNR2cEUoyt5JQBBEgWtgRUlhZ+35RTFcWJR2ChgBwHDUUwIhSCMABm1FPkw6X9HgWUKdReVWqxhWVJETA-G8ZxVHklRuqWCRCkwjoyohp5FQE9RBiQVDwPst7BeGoVsJw3B8AIQiiBI0iyPyjiWSxBVbqh66im8UoVIJ5xtRJb1qh9XBrRBCB2oedohP51wIT8kTJIG-zia9D7gr0-SDMM8LztMqho9ZARsudiTROUpxQUKPiHpEATCh8SR2qUVSPITCNk4RnYajCsagxaVkbex0Sw9cp2hC1UQljV0T5Ah3PwQdkRlBLypI5GthTjOA5gIzG2vMcxSJJEVT1YTASHuEHmskT-P1vVMqm22UtMM+r7vrY3WRYrIAK6D9JlHZHx5iktqcx7pYSszIpinanIq3414k0FZvk9JJGDGR2WKblFkZvl9JsvkuuFIX8Qa6krknSrOfQ4KsHG3zQcdaFH4RT+b59QlUl2wVa75Ke8HXGUTuE25MQvBVUqfIT56hMPIVquSeAQLPq7nNtpw-OeO8pJEnvnOdZXCzEUTecTwak6XUtn9mB6ltgaCUNojigiMkNmso7pAA */
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
          },
        },
        AuthWithGoogle: {
          invoke: {
            src: "AuthWithGoogleMachine",
            id: "AuthWithGoogleMachine",
            data: (_, event) => ({ jwt: event.data.jwt }),
            onDone: [
              {
                cond: "isExistingGoogleAccount",
                target: "End",
              },
              {
                target: "RegistrationMachine",
                actions: "assignAuthSession",
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
                target: "End",
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
          data: (_, event: { data: AuthSession }) => event.data,
        },
      },
    },
    {
      guards: {
        isExistingGoogleAccount: (context, event) => {
          console.debug("isExistingGoogleAccount", { context, event })
          return !!event.data.isRegistered
        },
        bool: (context, event) => event.data,
      },
      actions: {
        assignAuthSession: assign({
          authSession: (_, event) => event.data.authSession,
        }),
      },
      services: {
        isMobileWithWebAuthn,
        RegistrationMachine,
        RemoteReceiverMachine,
        loginWithAnchor,
        AuthWithGoogleMachine,
      },
    },
  )

export type UnknownDeviceActor = ActorRefFrom<typeof UnknownDeviceMachine>
export default UnknownDeviceMachine
