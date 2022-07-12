import { DelegationIdentity } from "@dfinity/identity"
import { ActorRefFrom, assign, createMachine } from "xstate"

export interface Context {
  signIdentity?: DelegationIdentity
}

export type Events =
  | { type: "AWAIT_CONFIRMATION" }
  | { type: "RECEIVE_DELEGATION"; data: DelegationIdentity }

const RemoteReceiverMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgE5gFsB7dMPMAYzAEsA3MXAOgEVcBhIiMAYgEEB1XgEkAKgH02AeQByAMSEAlALK8RQmYlAAHIrGrpqRAHaaQAD0QBGABwA2RgHYHAZgAstgKy2HABh8OAJksAGhAATytLH0YPPz8PAOsba2sEgF800LQscmJScio6BkYAGSJkCGojKG4FAFE2OqEANTqxABE6krqAcVV1aVMdPQNjUwsED1jGfyTrJwBODwdU61CIhAXLGbifW1cp-csPZwzMkCNOOFNsnHw8snxC+iZWDi4h3X1DEyRzRFcAXWVh8rkYrgWkMhUwW1kBtgCGSyGDuhBIj0oNBepXKlWqnxGP3GAJ8HhmqQWtmcCx8C1c8OBCCiYIhUKWHlh8MR51uuXRBSxxTqRggBO+Yz+Ewc+0cgICQROKWcgUZzPBbPZnICCKRIF5935T0FuDFo1+oAmNlV1jOaSAA */
  createMachine(
    {
      tsTypes: {} as import("./remote-receiver.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "auth-remote-receiver",
      initial: "QrCode",
      states: {
        QrCode: {
          on: {
            AWAIT_CONFIRMATION: {
              target: "Loading",
            },
          },
        },
        Loading: {
          on: {
            RECEIVE_DELEGATION: {
              actions: "ingestDelegation",
              target: "End",
            },
          },
        },
        End: {
          type: "final",
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

export type RemoteReceiverActor = ActorRefFrom<typeof RemoteReceiverMachine>

export default RemoteReceiverMachine
