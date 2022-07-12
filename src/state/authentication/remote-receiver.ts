import { DelegationIdentity } from "@dfinity/identity"
import { assign, createMachine } from "xstate"

interface Context {
  signIdentity?: DelegationIdentity
}

type Events =
  | { type: "AWAIT_CONFIRMATION" }
  | { type: "RECEIVE_DELEGATION"; data: DelegationIdentity }

const RemoteReceiverMachine = createMachine(
  {
    tsTypes: {} as import("./remote-receiver.typegen").Typegen0,
    schema: { events: {} as Events, context: {} as Context },
    id: "auth-remote-receiver",
    initial: "QrCode",
    states: {
      QrCode: {
        on: {
          AWAIT_CONFIRMATION: "Loading",
        },
      },
      Loading: {
        on: {
          RECEIVE_DELEGATION: {
            target: "End",
            actions: "ingestDelegation",
          },
        },
      },
      End: {
        type: "final",
        data: (context, event) => {
          if (!context.signIdentity) throw new Error("No sign identity")
          return context.signIdentity
        },
      },
    },
  },
  {
    actions: {
      ingestDelegation: assign({
        signIdentity: (context, event) => event.data,
      }),
    },
  },
)

export default RemoteReceiverMachine
