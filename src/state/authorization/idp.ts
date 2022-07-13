import { SignIdentity } from "@dfinity/agent"
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { ActorRefFrom, assign, createMachine } from "xstate"

import {
  awaitMessageFromClient,
  IdentityClientAuthEvent,
  postMessageToClient,
  prepareClientDelegate,
} from "frontend/integration/idp"
import { SignedDelegation } from "frontend/ui/pages/remote-authorize-app-unknown-device/hooks/use-unknown-device.config"

import AuthorizationMachine from "."
import AuthenticationMachine from "../authentication"

// TODO: Where should this live?
export interface User {
  signIdentity?: SignIdentity
  delegationIdentity?: DelegationIdentity
  sessionKey?: Ed25519KeyIdentity
  anchor?: string
}

interface Context extends User {
  maxTimeToLive?: number
}

type Events =
  | {
      type: "done.invoke.handshake"
      data: {
        maxTimeToLive: number
        sessionPublicKey: Uint8Array
        hostname: string
      }
    }
  | { type: "done.invoke.authenticate"; data: User }
  | { type: "done.invoke.authorize"; data: User }
  | { type: "done.invoke.done"; data: void }

async function handshake() {
  postMessageToClient({ kind: "ready" })
  return awaitMessageFromClient<IdentityClientAuthEvent>(
    "authorize-client",
  ).then((event) => ({
    maxTimeToLive: Number(event.data.maxTimeToLive),
    sessionPublicKey: event.data.sessionPublicKey,
    hostname: event.origin,
  }))
}

async function postDelegation(context: Context) {
  // const prepared = prepareClientDelegate(context)
  // postMessageToClient({
  //   kind: "authorize-client-success",
  //   userPublicKey: prepared.delegation.pubkey,
  //   delegations: prepared,
  // })
  return undefined
}

const IDPMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFmAduglgMbLpgC0A1jgPYDuOZEYAbkWAHQDK6yATugGII1HB3w5m1Ch2S1k+dIlAAHarAX4RSkAA9EAZgAMARnYBOfQHYArABoQAT0TGATC-bWAvp-tosuAmJSShp6RhY2dgBBDGw8IhJNHABZZEJMcTAhEQ5YHlJ2PzjAknIqOgYmVkIOGP94oKTU9MztVXUCLSRdRAA2M3cXO0dnQ31vX1iAhODysKrIusxqXnwAL0SRZozRbNF2PNLCqYbSkIrw6trYlfXNlLSdsDa1DS7QPQRjb8N2XutekN7E4vmNvD4QDQmPBukVpkEyqFKhEalwePwXh0ktpPgAWFzAxBmYwTEBw06zJGXRYnEqdB4tUSYt44HGIXH49guYyGCw2QlfYy9Dyk8l0xEXBaopa3Db07atbrtFlshAADkspkMljGrmGIO+wq8ELFMwl8xRHAAojgIMz6arjPpjGquS5-oD9USSSbaWbzharvbsd1Pi6BS7wZ4gA */
  createMachine(
    {
      tsTypes: {} as import("./idp.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
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
              actions: "ingestUser",
              target: "AuthorizationMachine",
            },
          },
        },
        AuthorizationMachine: {
          invoke: {
            src: "AuthorizationMachine",
            id: "authorize",
            data: (context) => context,
            onDone: {
              actions: "ingestUser",
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
        ingestUser: assign((context, event) => ({ ...event.data })),
      },
    },
  )

export type IDPActor = ActorRefFrom<typeof IDPMachine>
export type IDPMachineType = typeof IDPMachine

export default IDPMachine
