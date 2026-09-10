import { ActorRefFrom, assign, createMachine, fromPromise } from "xstate"

import { GoogleAuthSession } from "frontend/state/authentication"
import { AuthWithGoogleResult } from "../../auth-types"
import { signWithGoogleService } from "./services"

export interface AuthWithGoogleMachineContext {
  jwt: string
  authSession?: GoogleAuthSession
  isRegistered?: boolean
}

export type Events =
  | { type: "done.actor.signWithGoogleService"; output: GoogleAuthSession }
  | {
      type: "End"
      data: AuthWithGoogleResult
    }

const AuthWithGoogleMachineConfig = {
  id: "auth-with-goolge",
  context: ({ input }: { input: any }) => input as AuthWithGoogleMachineContext,
  initial: "FetchKeys",
  states: {
    FetchKeys: {
      invoke: {
        src: "signWithGoogleService",
        id: "signWithGoogleService",
        input: ({ context }: { context: AuthWithGoogleMachineContext }) =>
          context,
        onDone: {
          target: "End",
          actions: "assignAuthSession",
        },
      },
    },
    End: {
      type: "final" as const,
      output: ({ context }: { context: AuthWithGoogleMachineContext }) => {
        return context.authSession
      },
    },
  },
}

const AuthWithGoogleMachineOptions = {
  actions: {
    assignAuthSession: assign(({ event }: { event: any }) => {
      console.debug("AuthWithGoogleMachine assignAuthSession", {
        authSession: event.output,
      })
      return { authSession: event.output }
    }),
  },
  actors: {
    signWithGoogleService: fromPromise(
      ({ input }: { input: AuthWithGoogleMachineContext }) =>
        signWithGoogleService(input),
    ),
  },
}

const AuthWithGoogleMachine = createMachine(
  AuthWithGoogleMachineConfig,
  AuthWithGoogleMachineOptions,
)

export type AuthWithGoogleActor = ActorRefFrom<typeof AuthWithGoogleMachine>

export default AuthWithGoogleMachine
