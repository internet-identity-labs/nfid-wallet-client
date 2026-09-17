import { setup, fromPromise, assign, ActorRefFrom } from "xstate"

import { GoogleAuthSession } from "frontend/state/authentication"
import { signWithGoogleService } from "./services"

export interface AuthWithGoogleMachineContext {
  jwt: string
  authSession?: GoogleAuthSession
}

const AuthWithGoogleMachine = setup({
  types: {} as {
    context: AuthWithGoogleMachineContext
    input: { jwt: string }
    output: GoogleAuthSession | undefined
  },
  actors: {
    signWithGoogleService: fromPromise(
      async ({
        input,
      }: {
        input: AuthWithGoogleMachineContext
      }): Promise<GoogleAuthSession> => signWithGoogleService(input),
    ),
  },
  actions: {
    assignAuthSession: assign({
      authSession: ({ event }) => (event as any).output as GoogleAuthSession,
    }),
  },
}).createMachine({
  id: "auth-with-google",
  context: ({ input }) => ({ jwt: input.jwt }),
  initial: "FetchKeys",
  states: {
    FetchKeys: {
      invoke: {
        src: "signWithGoogleService",
        input: ({ context }) => context,
        onDone: {
          target: "End",
          actions: "assignAuthSession",
        },
        onError: {
          target: "AuthSelection",
        },
      },
    },
    End: {
      type: "final" as const,
      output: ({ context }) => context.authSession,
    },
  },
})

export type AuthWithGoogleActor = ActorRefFrom<typeof AuthWithGoogleMachine>

export default AuthWithGoogleMachine
