import { DelegationIdentity } from "@dfinity/identity"
import { assign, createMachine, DoneInvokeEvent } from "xstate"

import KnownDeviceMachine from "./known-device"
import UnknownDeviceMachine from "./unknown-device"

interface Context {
  signIdentity?: DelegationIdentity
}

function isDeviceRegistered() {
  // Pull from integration layer: either existing local storage, or refactored device service
  return true
}

type Events =
  | { type: "done.invoke.known-device"; data: DelegationIdentity }
  | { type: "done.invoke.unknown-device"; data: DelegationIdentity }

/** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFmAduglgMbIED2OAtAE6mnoB0AkrACJgBuRYASmFPrHRgqkAMSJQAB1Kx8ZHBJAAPRBQBMABgBs9AOy6AHLoAsAVmPGtATgNWtWgDQgAnqoDMbq-QPa3aq2pqbgCMwaZqAL4RTmhYuATE8tS0DADSOKQA7jhsnIRgohDkYPT4OOykANYllRnZFBAcXIrSsvKKKggUbgYG9Bq65sZqwbraulpqTq4IAfRuGhp2wVamISZuplExGNh4RCT45Ml09ACqOLVZOU35hcWl5VUlqJd1lI15YC0yckcKSGUiFMXi0xiMa1sulWfl000QcwWSy0KzWo2Mmyi0RAGUa8EBsT2CUOxxop2YuS4vH4gmEkB+bX+HVUKzU9C0ulhEOCGlMJnhXWGXlWE2GxlGVgmdm2IEJ8QOSTJaXelPyDL+5GZgts7OCZkCpgM-gM5gFFB5fQ0bk5Fisww0YXCMrl+0S-xODAuV2yqu+gNaGoBoE63Tc-VCbmsfjWpkmxjNFv61rctvtjsi2JdxMVKXoLGK6vagJDetM9HFjoC0N0alsBgFfmM7JTNaswWthq2md28rdpJShaZxdUpnbuv1akNxtNLhHGjZIq0PX8wy0BiXWIiQA */
const authenticationMachine = createMachine(
  {
    tsTypes: {} as import("./index.typegen").Typegen0,
    schema: { events: {} as Events, context: {} as Context },
    id: "authentication-root",
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
              target: "Done",
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
              target: "Done",
            },
          ],
        },
      },
      Done: {
        type: "final",
        data: (context) => {
          if (!context.signIdentity) throw new Error("No sign identity")
          return context.signIdentity
        },
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
  },
)

export default authenticationMachine
