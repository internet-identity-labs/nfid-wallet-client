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

type AuthWithGoogleMachineTypes = {
  context: AuthWithGoogleMachineContext
  events: Events
  input: Partial<AuthWithGoogleMachineContext>
  output: GoogleAuthSession
}

const AuthWithGoogleMachineOptions = {
  actions: {
    assignAuthSession: assign<
      AuthWithGoogleMachineContext,
      Events,
      undefined,
      Events,
      any
    >({
      authSession: ({ event }: { event: Events }) =>
        (
          event as Extract<
            Events,
            { type: "done.invoke.signWithGoogleService" }
          >
        ).output,
    }),
    debugDone: ({ event }: { event: Events }) => {
      console.debug("AuthWithGoogleMachine assignAuthSession", {
        eventType: event.type,
      })
    },
  },
  actors: {
    signWithGoogleService: fromPromise(
      async ({ input }: { input: AuthWithGoogleMachineContext }) =>
        signWithGoogleServiceImpl(input),
    ),
  },
}

const AuthWithGoogleMachine = setup({
  types: {} as AuthWithGoogleMachineTypes,
  ...AuthWithGoogleMachineOptions,
}).createMachine({
  id: "auth-with-goolge",
  initial: "FetchKeys",
  output: ({ context }: { context: AuthWithGoogleMachineContext }) =>
    context.authSession!,
  context: ({ input }: { input?: Partial<AuthWithGoogleMachineContext> }) =>
    ({
      jwt: "",
      ...(input ?? {}),
    }) as AuthWithGoogleMachineContext,
  states: {
    FetchKeys: {
      invoke: {
        src: "signWithGoogleService" as const,
        id: "signWithGoogleService",
        input: ({ context }: { context: AuthWithGoogleMachineContext }) =>
          context,
        onDone: {
          target: "End",
          actions: ["debugDone", "assignAuthSession"],
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
})

export type AuthWithGoogleActor = ActorRefFrom<typeof AuthWithGoogleMachine>

export default AuthWithGoogleMachine
