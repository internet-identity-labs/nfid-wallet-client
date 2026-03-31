import { ActorRefFrom, assign, createMachine } from "xstate"

import { GoogleAuthSession } from "frontend/state/authentication"
import { AuthWithGoogleResult } from "../../auth-types"
import { signWithGoogleService } from "./services"

export interface AuthWithGoogleMachineContext {
  jwt: string
  authSession?: GoogleAuthSession
  isRegistered?: boolean
}

export type Events =
  | { type: "done.invoke.signWithGoogleService"; data: GoogleAuthSession }
  | {
      type: "End"
      data: AuthWithGoogleResult
    }

export interface Schema {
  events: Events
  context: AuthWithGoogleMachineContext
}

const AuthWithGoogleMachineConfig = {
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgO4EstsoB7EgGxgDoAxMdAY0wGkwBPWAYghIDswq+XgDcSAawEAzekwDiZKOTAARMMPwMwAZTAAndZsSgADiViF8fIyAAeiAJwA2KgHYAHAEYATB48vHnj4ArF4ANCBsiF4ALC5U0R5BLl5usS4ADOlBjtEAvrnhaEQERKQU1Fr4ULwAkrzcfAJCohJU5tV1AOqEmPIkitp6BmDWpubolrzWdgj2AMxU9u5zXunJHulzOXPhkQix6VRzbqnRXo450Y726Xn54bwkEHDWRTglOGWUAnSMLOzwJAgMYWKxAmZnXaIDZxexwpxBJy+RwpRz3EBvPA9Yhkb5USodKZAkETMGgCEeRbwrzJLxzIKeRweKEIOZZKhJXwxaJs-zJdGYj448oCADCmDADDEACUwFB8LB0LpkKTeFp0CrUICTGZQUTyYgElS4S4kgkPPMXPYWUFotEOW50qk3HMPAlbgKMO9sV9qABRXgQUa61XTaEue1zex0uauoJOxxZFkuDxuKhZF1OJmJkIuT3FH24mDB8aTMMIPzG6O0+mMp0s+lV64xRFOu35fJAA */
  predictableActionArguments: true,
  tsTypes: {} as import("./auth-with-google.typegen").Typegen0,
  schema: { events: {}, context: {} } as Schema,
  id: "auth-with-goolge",
  initial: "FetchKeys",
  states: {
    FetchKeys: {
      invoke: {
        src: "signWithGoogleService",
        id: "signWithGoogleService",
        onDone: {
          target: "End",
          actions: "assignAuthSession",
        },
      },
    },
    End: {
      type: "final" as const,
      data: (context: AuthWithGoogleMachineContext) => {
        return context.authSession
      },
    },
  },
}

const AuthWithGoogleMachineOptions: Parameters<
  typeof createMachine<AuthWithGoogleMachineContext, Events, any>
>[1] = {
  actions: {
    assignAuthSession: assign({
      authSession: (_: AuthWithGoogleMachineContext, event: any) => {
        console.debug("AuthWithGoogleMachine assignAuthSession", {
          authSession: event.data,
        })
        return event.data
      },
    }),
  },
  services: {
    signWithGoogleService,
  },
}

const AuthWithGoogleMachine = createMachine(
  AuthWithGoogleMachineConfig,
  AuthWithGoogleMachineOptions,
)

export type AuthWithGoogleActor = ActorRefFrom<typeof AuthWithGoogleMachine>

export default AuthWithGoogleMachine
