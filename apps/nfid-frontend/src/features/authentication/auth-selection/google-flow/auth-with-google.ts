import { ActorRefFrom, assign, fromPromise, setup } from "xstate"

import { GoogleAuthSession } from "frontend/state/authentication"
import { AuthWithGoogleResult } from "../../auth-types"
import { signWithGoogleService as signWithGoogleServiceImpl } from "./services"

export interface AuthWithGoogleMachineContext {
  jwt: string
  authSession?: GoogleAuthSession
  isRegistered?: boolean
}

export type Events =
  | { type: "done.invoke.signWithGoogleService"; output: GoogleAuthSession }
  | {
      type: "End"
      data: AuthWithGoogleResult
    }

const AuthWithGoogleMachineOptions = {
  actions: {
    assignAuthSession: assign({
      authSession: (_: AuthWithGoogleMachineContext, event: any) => {
        console.debug("AuthWithGoogleMachine assignAuthSession", {
          authSession: event.output,
        })
        return event.output
      },
    }),
  },
  actors: {
    signWithGoogleService: fromPromise(
      async ({ input }: { input: AuthWithGoogleMachineContext }) =>
        signWithGoogleServiceImpl(input),
    ),
  },
}

const AuthWithGoogleMachine = setup({
  types: {} as any,
  ...AuthWithGoogleMachineOptions,
} as any).createMachine({
  id: "auth-with-goolge",
  initial: "FetchKeys",
  context: (args: any) =>
    ({
      jwt: "",
      ...(args.input ?? {}),
    }) as AuthWithGoogleMachineContext,
  states: {
    FetchKeys: {
      invoke: {
        src: "signWithGoogleService",
        id: "signWithGoogleService",
        input: (args: any) => args.context,
        onDone: {
          target: "End",
          actions: "assignAuthSession",
        },
      },
    },
    End: {
      type: "final" as const,
      output: (context: AuthWithGoogleMachineContext) => {
        return context.authSession
      },
    },
  },
} as any)

export type AuthWithGoogleActor = ActorRefFrom<typeof AuthWithGoogleMachine>

export default AuthWithGoogleMachine
