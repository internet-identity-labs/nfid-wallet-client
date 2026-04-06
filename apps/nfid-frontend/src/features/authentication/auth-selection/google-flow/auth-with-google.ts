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
    assignAuthSession: assign(({ event }: any) => {
      console.debug("AuthWithGoogleMachine assignAuthSession", {
        authSession: event.output,
      })
      return { authSession: event.output }
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
  output: ({ context }: { context: AuthWithGoogleMachineContext }) =>
    context.authSession,
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
        const session = context.authSession
        // eslint-disable-next-line no-console
        console.debug("[/embed-auth] AuthWithGoogleMachine End.output", {
          hasAuthSession: !!session,
          anchor: session?.anchor,
          sessionSource: (session as { sessionSource?: string })?.sessionSource,
        })
        return session
      },
    },
  },
} as any)

export type AuthWithGoogleActor = ActorRefFrom<typeof AuthWithGoogleMachine>

export default AuthWithGoogleMachine
