import { DelegationIdentity } from "@dfinity/identity"
import { assign, createMachine, DoneInvokeEvent } from "xstate"

import KnownDeviceMachine from "./known-device"
import UnknownDeviceMachine from "./unknown-device"

interface Context {
  signIdentity?: DelegationIdentity
}

export function isDeviceRegistered() {
  // Pull from integration layer: either existing local storage, or refactored device service
  return false
}

type Events =
  | { type: "done.invoke.known-device"; data: DelegationIdentity }
  | { type: "done.invoke.unknown-device"; data: DelegationIdentity }

/** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOgJKwBEwA3ASwGMwAlMKU2dMAJ0gGJFQAHAe1lPVLcAdhxAAPRACYAbAGZsk2QBZZAdgCsAGhABPKQEZV2dQAYz0gBwmlJgJy2l6gL5PtaLNgDSQ7gHchRGSUrBDCYNikQsTcANbhMT7+ALQQJBRgojx8AsKiEgi2htjSqraWGtp6CJLqtthm5lY29o4ubhg4AKpCCX4BacGhQuGR0XHYqD2JQikDGUggWfyCIgv5hUYlZRYVuoj6+ur1DWrqikr6cqouriA+qfAL7jj4gek0dAzMkJm8y7lrRBKSSVKSqSTGBqWax2BzOW7PLzTN6UX7ZFZ5RDqIpbcpaPbVWRHBomaHNOFtECI7q9fwo+ZcP45VagfLYzalPGggr6Y4NVRmdQWWQWSRKSmIgCiQggaP+LPE+30amwRNsp25yqMpjMp3OlxFEo6cuZmIQ+gsmosNycQA */
const authenticationMachine = createMachine(
  {
    tsTypes: {} as import("./index.typegen").Typegen0,
    schema: { events: {} as Events, context: {} as Context },
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

export default authenticationMachine
