import { setup, ActorRefFrom } from "xstate"

import AuthenticationMachine from "../root/root-machine"

const NFIDAuthMachine = setup({
  actors: {
    AuthenticationMachine,
  },
}).createMachine({
  id: "auth-machine",
  context: {},
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
        onDone: { target: "End" },
      },
    },
    End: {
      type: "final" as const,
    },
  },
})

export type NFIDAuthMachineActor = ActorRefFrom<typeof NFIDAuthMachine>
export type NFIDAuthMachineType = typeof NFIDAuthMachine
export default NFIDAuthMachine
