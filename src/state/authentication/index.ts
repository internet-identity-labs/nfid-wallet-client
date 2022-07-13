import { DelegationIdentity } from "@dfinity/identity"
import { ActorRefFrom, assign, createMachine, DoneInvokeEvent } from "xstate"

import KnownDeviceMachine from "./known-device"
import UnknownDeviceMachine from "./unknown-device"

export interface Context {
  signIdentity?: DelegationIdentity
}

export type Events =
  | { type: "done.invoke.known-device"; data: DelegationIdentity }
  | { type: "done.invoke.unknown-device"; data: DelegationIdentity }

export interface Schema {
  events: Events
  context: Context
}

export function isDeviceRegistered() {
  // Pull from integration layer: either existing local storage, or refactored device service
  return false
}

/** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOgJKwBEwA3ASwGMwAlMKU2dMAJ0gGJFQAHAe1lPVLcAdhxAAPRACYAbAGZsk2QBZZAdgCsAGhABPKQEZV2dQAYz0gBwmlJgJy2l6gL5PtaLNgDSQ7gHchRGSUrBDCYNikQsTcANbhMT7+ALQQJBRgojx8AsKiEgi2htjSqraWGtp6CJLqtthm5lY29o4ubhg4AKpCCX4BacGhQuGR0XHYqD2JQikDGUggWfyCIgv5hUYlZRYVuoj6+ur1DWrqikr6cqouriA+qfAL7jj4gek0dAzMkJm8y7lrRBKSSVKSqSTGBqWax2BzOW7PLzTN6UX7ZFZ5RDqIpbcpaPbVWRHBomaHNOFtECI7q9fwo+ZcP45VagfLYzalPGggr6Y4NVRmdQWWQWSRKSmIgCiQggaP+LPE+30amwRNsp25yqMpjMp3OlxFEo6cuZmIQ+gsmosNycQA */
const AuthenticationMachine = createMachine(
  {
    tsTypes: {} as import("./index.typegen").Typegen0,
    schema: { events: {}, context: {} } as Schema,
    id: "auth",
    initial: "IsDeviceRegistered",
    context: {},
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
              actions: "ingestSignIdentity",
              target: "End",
            },
          ],
        },
      },
      UnknownDevice: {
        invoke: {
          src: "UnknownDeviceMachine",
          id: "unknown-device",
          onDone: [
            {
              actions: "ingestSignIdentity",
              target: "End",
            },
          ],
        },
      },
      End: {
        type: "final",
        data: (context) => context.signIdentity,
      },
    },
  },
  {
    actions: {
      ingestSignIdentity: assign({
        signIdentity: (context, event) => event.data,
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
