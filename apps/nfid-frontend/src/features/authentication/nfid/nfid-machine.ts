import { ActorRefFrom, assign, createMachine } from "xstate"

import { AbstractAuthSession } from "frontend/state/authentication"

import AuthenticationMachine from "../root/root-machine"

export interface AuthenticationContext {
  authSession?: AbstractAuthSession
}

const NFIDAuthMachineConfig = {
  id: "auth-machine",
  context: {} as AuthenticationContext,
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
      type: "final" as const,
    },
  },
}

const NFIDAuthMachineOptions = {
  guards: {},
  actions: {
    assignAuthSession: assign(({ event }: { event: any }) => ({
      authSession: event.output,
    })),
  },
  actors: {
    AuthenticationMachine,
  },
}

const NFIDAuthMachine = createMachine(
  NFIDAuthMachineConfig,
  NFIDAuthMachineOptions,
)

export type NFIDAuthMachineActor = ActorRefFrom<typeof NFIDAuthMachine>
export type NFIDAuthMachineType = typeof NFIDAuthMachine
export default NFIDAuthMachine
