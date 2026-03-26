import { ActorRefFrom, assign, createMachine } from "xstate"

import { AbstractAuthSession } from "frontend/state/authentication"

import AuthenticationMachine, {
  AuthenticationContext as RootAuthenticationContext,
} from "../root/root-machine"

export interface AuthenticationContext {
  authSession?: AbstractAuthSession
}

export type Events = {
  type: "done.invoke.AuthenticationMachine"
  data: AbstractAuthSession
}

const NFIDAuthMachine = createMachine(
  {
    id: "nfid-auth-flow",
    initial: "AuthenticationMachine",
    states: {
      AuthenticationMachine: {
        invoke: {
          src: "AuthenticationMachine",
          id: "AuthenticationMachine",
          input: {
            verificationEmail: "",
            authRequest: {
              hostname: window.location.origin,
            },
          },
          onDone: { target: "End", actions: "assignAuthSession" },
        },
      },
      End: {
        type: "final",
      },
    },
  },
  {
    guards: {},
    actions: {
      assignAuthSession: assign(({ event }) => {
        const e = event as unknown as {
          output?: RootAuthenticationContext
          data?: AbstractAuthSession
        }
        return {
          authSession: e.output?.authSession ?? e.data,
        }
      }),
    },
    actors: {
      AuthenticationMachine,
    },
  },
)

export type NFIDAuthMachineActor = ActorRefFrom<typeof NFIDAuthMachine>
export type NFIDAuthMachineType = typeof NFIDAuthMachine
export default NFIDAuthMachine
