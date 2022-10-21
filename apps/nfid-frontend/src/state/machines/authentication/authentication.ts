import { ActorRefFrom, assign, createMachine } from "xstate"

import { isDeviceRegistered } from "frontend/integration/identity-manager/services"
import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"
import KnownDeviceMachine, {
  KnownDeviceMachineContext,
} from "frontend/state/machines/authentication/known-device"
import UnknownDeviceMachine from "frontend/state/machines/authentication/unknown-device"

export interface AuthenticationMachineContext {
  anchor: number
  authSession?: AuthSession
  authRequest?: AuthorizationRequest
  appMeta: AuthorizingAppMeta
}

export type Events =
  | { type: "done.invoke.known-device"; data: AuthSession }
  | { type: "done.invoke.unknown-device"; data: AuthSession }

export interface Schema {
  events: Events
  context: AuthenticationMachineContext
}

const AuthenticationMachine = createMachine(
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOgJKwBEwA3ASwGMwAlMKU2dMAJ0gGJFQAHAe1lPVLcAdhxAAPRACYAbAGZsk2QBZZAdgCsAGhABPKQEZV2dQAYz0gBwmlJgJy2l6gL5PtaLNgDSQ7gHchRGSUrBDCYNikQsTcANbhMT7+ALQQJBRgojx8AsKiEgi2htjSqraWGtp6CJLqtthm5lY29o4ubhg4AKpCCX4BacGhQuGR0XHYqD2JQikDGUggWfyCIgv5hUYlZRYVuoj6+ur1DWrqikr6cqouriA+qfAL7jj4gek0dAzMkJm8y7lrRBKSSVKSqSTGBqWax2BzOW7PLzTN6UX7ZFZ5RDqIpbcpaPbVWRHBomaHNOFtECI7q9fwo+ZcP45VagfLYzalPGggr6Y4NVRmdQWWQWSRKSmIgCiQggaP+LPE+30amwRNsp25yqMpjMp3OlxFEo6cuZmIQ+gsmosNycQA */
  {
    tsTypes: {} as import("./authentication.typegen").Typegen0,
    schema: { events: {}, context: {} } as Schema,
    id: "auth",
    initial: "IsDeviceRegistered",
    states: {
      IsDeviceRegistered: {
        always: [
          {
            cond: "isDeviceRegistered",
            target: "KnownDevice",
          },
          {
            target: "UnknownDevice",
          },
        ],
      },
      KnownDevice: {
        invoke: {
          src: "KnownDeviceMachine",
          id: "known-device",
          onDone: [
            {
              actions: "assignAuthSession",
              target: "End",
            },
          ],
          data: (context) =>
            ({
              appMeta: context.appMeta,
              authRequest: context.authRequest,
            } as Pick<KnownDeviceMachineContext, "appMeta" | "authRequest">),
        },
      },
      UnknownDevice: {
        invoke: {
          src: "UnknownDeviceMachine",
          id: "unknown-device",
          onDone: [
            {
              actions: "assignAuthSession",
              target: "End",
            },
          ],
          data: (context) => context,
        },
      },
      End: {
        type: "final",
        data: (context) => context.authSession,
      },
    },
  },
  {
    actions: {
      assignAuthSession: assign((context, event) => {
        console.debug("AuthenticationMachine assignAuthSession", {
          authSession: event.data,
        })
        return {
          authSession: event.data,
        }
      }),
    },
    guards: {
      isDeviceRegistered,
    },
    services: {
      KnownDeviceMachine,
      UnknownDeviceMachine,
    },
  },
)

export type AuthenticationActor = ActorRefFrom<typeof AuthenticationMachine>

export default AuthenticationMachine
