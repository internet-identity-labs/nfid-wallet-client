import { ActorRefFrom, createMachine } from "xstate"

import { authState } from "@nfid/integration"

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

export type Events =
  | {
      type: "RECEIVE_DELEGATION"
      data: RemoteDeviceAuthSession
    }
  | { type: "BACK" }

const RemoteReceiverMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgE5gFsB7dMPMAYzAEsA3MXAOgCVKb6BiZgUQGFuAkgDVuAfQAi3ADLcA4gEEAKgIDyAOUSgADkVjV01IgDtNIAB6IAjAA4AbIwCsAFicAmAOwBmAAxOAnE7u3n6uADQgAJ6IfvZ+7g6uTt62fsFOlu6uAL454UZEEHCmaFjkxKTkVHQMLGzVpjp6BsamFghu4VEIqYxxlp4D7tbWQUnuuSAlOPjlZPhV9EzcRhANuvqGJkjmiEmWjBkxIa5+DrbucZ6d0d697v2Dw6PenhNTZSRzdYtrTZutVms1wQNhyOSAA */
  createMachine(
    {
      tsTypes: {} as import("./remote-receiver.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      initial: "Receive",
      id: "auth-remote-receiver",
      states: {
        Receive: {
          on: {
            RECEIVE_DELEGATION: {
              target: "End",
            },
            BACK: {
              target: "Back",
            },
          },
        },
        End: {
          type: "final",
          data: (context, event: { data: RemoteDeviceAuthSession }) => {
            // NOTE: where should this ideally live?
            authState.set({
              identity: event.data.identity,
              delegationIdentity: event.data.delegationIdentity,
            })
            return event.data
          },
        },
        Back: {
          type: "final",
        },
      },
    },
    {},
  )

export type RemoteReceiverActor = ActorRefFrom<typeof RemoteReceiverMachine>

export default RemoteReceiverMachine
