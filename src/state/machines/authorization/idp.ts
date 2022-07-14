import { ActorRefFrom, assign, createMachine } from "xstate"

import { SignedDelegate } from "frontend/integration/internet-identity"
import {
  handshake,
  postDelegation,
} from "frontend/integration/windows/services"
import { AuthSession } from "frontend/state/authentication"
import AuthenticationMachine from "frontend/state/machines/authentication"
import AuthorizationMachine from "frontend/state/machines/authorization"

export interface IDPMachineContext {
  authSession?: AuthSession
  authRequest?: {
    maxTimeToLive: number
    sessionPublicKey: Uint8Array
    hostname: string
  }
}

export type IDPMachineEvents =
  | {
      type: "done.invoke.handshake"
      data: {
        maxTimeToLive: number
        sessionPublicKey: Uint8Array
        hostname: string
      }
    }
  | { type: "done.invoke.authenticate"; data: AuthSession }
  | { type: "done.invoke.authorize"; data: AuthSession }
  | { type: "done.invoke.done"; data: void }

interface Schema {
  context: IDPMachineContext
  events: IDPMachineEvents
}
const IDPMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFmAduglgMbLpgC0A1jgPYDuOZEYAbkWAHQDK6yATugGII1HB3w5m1Ch2S1k+dIlAAHarAX4RSkAA9EAZgAMARnYBOfQHYArABoQAT0TGATC-bWAvp-tosuAmJSShp6RhY2dgBBDGw8IhJNHABZZEJMcTAhEQ5YHlJ2PzjAknIqOgYmVkIOGP94oKTU9MztVXUCLSRdRAA2M3cXO0dnQ31vX1iAhODysKrIusxqXnwAL0SRZozRbNF2PNLCqYbSkIrw6trYlfXNlLSdsDa1DS7QPQRjb8N2XutekN7E4vmNvD4QDQmPBukVpkEyqFKhEalwePwXh0ktpPgAWFzAxBmYwTEBw06zJGXRYnEqdB4tUSYt44HGIXH49guYyGCw2QlfYy9Dyk8l0xEXBaopa3Db07atbrtFlshAADkspkMljGrmGIO+wq8ELFMwl8xRHAAojgIMz6arjPpjGquS5-oD9USSSbaWbzharvbsd1Pi6BS7wZ4gA */
  createMachine(
    {
      tsTypes: {} as import("./idp.typegen").Typegen0,
      schema: {
        events: {},
        context: {},
      } as Schema,
      id: "idp",
      initial: "Start",
      states: {
        Start: {
          invoke: {
            src: "handshake",
            id: "handshake",
            onDone: [
              {
                target: "AuthenticationMachine",
                actions: "ingestRequest",
              },
            ],
          },
        },
        AuthenticationMachine: {
          invoke: {
            src: "AuthenticationMachine",
            id: "authenticate",
            onDone: {
              actions: "ingestAuthSession",
              target: "AuthorizationMachine",
            },
          },
        },
        AuthorizationMachine: {
          invoke: {
            src: "AuthorizationMachine",
            id: "authorize",
            data: (context) => ({
              authRequest: context.authRequest,
            }),
            onDone: {
              actions: "ingestAuthSession",
              target: "End",
            },
          },
        },
        End: {
          invoke: {
            src: "postDelegation",
            id: "done",
          },
          type: "final",
        },
      },
    },
    {
      services: {
        handshake,
        postDelegation,
        AuthenticationMachine,
        AuthorizationMachine,
      },
      actions: {
        ingestAuthSession: assign((context, event) => ({
          authSession: event.data,
        })),
        ingestRequest: assign((context, event) => ({
          authRequest: event.data,
        })),
      },
    },
  )

export type IDPActor = ActorRefFrom<typeof IDPMachine>
export type IDPMachineType = typeof IDPMachine

export default IDPMachine
