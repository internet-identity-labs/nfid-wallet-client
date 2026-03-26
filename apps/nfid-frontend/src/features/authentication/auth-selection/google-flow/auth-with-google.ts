import { ActorRefFrom, assign, createMachine, fromPromise } from "xstate"

import { GoogleAuthSession } from "frontend/state/authentication"

import { signWithGoogleService } from "./services"

export interface AuthWithGoogleMachineContext {
  jwt: string
  authSession?: GoogleAuthSession
  isRegistered?: boolean
}

const AuthWithGoogleMachine = createMachine(
  {
    types: {
      context: {} as AuthWithGoogleMachineContext,
      input: {} as { jwt: string } | undefined,
    },
    id: "auth-with-goolge",
    initial: "FetchKeys",
    context: ({ input }: { input?: { jwt: string } }) => ({
      jwt: input?.jwt ?? "",
    }),
    states: {
      FetchKeys: {
        invoke: {
          src: "signWithGoogleService",
          id: "signWithGoogleService",
          input: ({ context: ctx }) => ctx,
          onDone: {
            target: "End",
            actions: "assignAuthSession",
          },
        },
      },
      End: {
        type: "final",
        output: ({ context: ctx }) => ctx.authSession,
      },
    },
  },
  {
    actions: {
      assignAuthSession: assign(({ event }) => {
        const e = event as unknown as {
          output?: GoogleAuthSession
          data?: GoogleAuthSession
        }
        const output = e.output ?? e.data
        console.debug("AuthWithGoogleMachine assignAuthSession", {
          authSession: output,
        })
        return { authSession: output }
      }),
    },
    actors: {
      signWithGoogleService: fromPromise(({ input }) =>
        signWithGoogleService(input as AuthWithGoogleMachineContext),
      ),
    },
  },
)

export type AuthWithGoogleActor = ActorRefFrom<typeof AuthWithGoogleMachine>

export default AuthWithGoogleMachine
