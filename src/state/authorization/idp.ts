import { DelegationIdentity } from "@dfinity/identity"
import { ActorRefFrom, assign, createMachine } from "xstate"

import AuthorizationMachine from "."
import AuthenticationMachine from "../authentication"

interface Context {
  signIdentity?: DelegationIdentity
  delegationChain?: DelegationIdentity
}

type Events =
  | { type: "done.invoke.await"; data: void }
  | { type: "done.invoke.authenticate"; data: DelegationIdentity }
  | { type: "done.invoke.authorize"; data: DelegationIdentity }
  | { type: "done.invoke.done"; data: void }

async function postReady() {
  console.log("Post ready message to pubsub...")
  console.log("Await request message from pubsub...")
  return new Promise<void>((res) => setTimeout(() => res(undefined), 3000))
}

async function postDelegation() {
  console.log("Post delegation chain to pubsub")
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
            src: "postReady",
            id: "await",
            onDone: [
              {
                target: "AuthenticationMachine",
              },
            ],
          },
        },
        AuthenticationMachine: {
          invoke: {
            src: "AuthenticationMachine",
            id: "authenticate",
            onDone: {
              actions: "ingestSignIdentity",
              target: "AuthorizationMachine",
            },
          },
        },
        AuthorizationMachine: {
          invoke: {
            src: "AuthorizationMachine",
            id: "authorize",
            onDone: {
              actions: "ingestDelegationChain",
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
        postReady,
        postDelegation,
        AuthenticationMachine,
        AuthorizationMachine,
      },
      actions: {
        ingestSignIdentity: assign({
          signIdentity: (context, event) => event.data,
        }),
        ingestDelegationChain: assign({
          delegationChain: (context, event) => event.data,
        }),
      },
    },
  )

export type IDPActor = ActorRefFrom<typeof IDPMachine>
export type IDPMachineType = typeof IDPMachine

export default IDPMachine
