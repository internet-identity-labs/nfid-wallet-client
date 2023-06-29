import { ActorRefFrom, assign, createMachine } from "xstate"

import { checkRegistrationStatus } from "frontend/integration/identity-manager/services"
import {
  fetchGoogleDevice,
  GoogleDeviceResult,
  getGoogleAuthSession,
} from "frontend/integration/lambda/google"
import { GoogleAuthSession } from "frontend/state/authentication"

export interface AuthWithGoogleMachineContext {
  jwt: string
  authSession?: GoogleAuthSession
  isRegistered?: boolean
}

export type Events =
  | { type: "done.invoke.fetchGoogleDeviceService"; data: GoogleDeviceResult }
  | { type: "done.invoke.signInWithGoogleService"; data: GoogleAuthSession }
  | { type: "done.invoke.checkRegistrationStatus"; data: boolean }
  | {
      type: "End"
      data: { authSession: GoogleAuthSession; isRegistered: boolean }
    }

export interface Schema {
  events: Events
  context: AuthWithGoogleMachineContext
}

const AuthWithGoogleMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgO4EstsoB7EgGxgDoAxMdAY0wGkwBPWAYghIDswq+XgDcSAawEAzekwDiZKOTAARMMPwMwAZTAAndZsSgADiViF8fIyAAeiAJwA2KgHYAHAEYATB48vHnj4ArF4ANCBsiF4ALC5U0R5BLl5usS4ADOlBjtEAvrnhaEQERKQU1Fr4ULwAkrzcfAJCohJU5tV1AOqEmPIkitp6BmDWpubolrzWdgj2AMxU9u5zXunJHulzOXPhkQix6VRzbqnRXo450Y726Xn54bwkEHDWRTglOGWUAnSMLOzwJAgMYWKxAmZnXaIDZxexwpxBJy+RwpRz3EBvPA9Yhkb5USodKZAkETMGgCEeRbwrzJLxzIKeRweKEIOZZKhJXwxaJs-zJdGYj448oCADCmDADDEACUwFB8LB0LpkKTeFp0CrUICTGZQUTyYgElS4S4kgkPPMXPYWUFotEOW50qk3HMPAlbgKMO9sV9qABRXgQUa61XTaEue1zex0uauoJOxxZFkuDxuKhZF1OJmJkIuT3FH24mDB8aTMMIPzG6O0+mMp0s+lV64xRFOu35fJAA */
  createMachine(
    /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOgJKwBEwA3ASwGMwAlMKU2dMAJ0gGJFQAHAe1lPVLcAdhxAAPRACYAbAGZsk2QBZZAdgCsAGhABPKQEZV2dQAYz0gBwmlJgJy2l6gL5PtaLNgDSQ7gHchRGSUrBDCYNikQsTcANbhMT7+ALQQJBRgojx8AsKiEgi2htjSqraWGtp6CJLqtthm5lY29o4ubhg4AKpCCX4BacGhQuGR0XHYqD2JQikDGUggWfyCIgv5hUYlZRYVuoj6+ur1DWrqikr6cqouriA+qfAL7jj4gek0dAzMkJm8y7lrRBKSSVKSqSTGBqWax2BzOW7PLzTN6UX7ZFZ5RDqIpbcpaPbVWRHBomaHNOFtECI7q9fwo+ZcP45VagfLYzalPGggr6Y4NVRmdQWWQWSRKSmIgCiQggaP+LPE+30amwRNsp25yqMpjMp3OlxFEo6cuZmIQ+gsmosNycQA */
    {
      tsTypes: {} as import("./auth-with-google.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      id: "auth-with-goolge",
      initial: "FetchKeys",
      states: {
        FetchKeys: {
          invoke: {
            src: "fetchGoogleDeviceService",
            id: "fetchGoogleDeviceService",
            onDone: "SignIn",
          },
        },
        SignIn: {
          invoke: {
            src: "signInWithGoogleService",
            id: "signInWithGoogleService",
            onDone: {
              target: "CheckRegistrationStatus",
              actions: "assignAuthSession",
            },
          },
        },
        CheckRegistrationStatus: {
          invoke: {
            src: "checkRegistrationStatus",
            id: "checkRegistrationStatus",
            onDone: { target: "End", actions: "assignRegistrationStatus" },
          },
        },
        End: {
          type: "final",
          data: (context) => {
            return context.authSession
          },
        },
      },
    },
    {
      actions: {
        assignAuthSession: assign({
          authSession: (_, event) => {
            console.debug("AuthWithGoogleMachine assignAuthSession", {
              authSession: event.data,
            })
            return event.data
          },
        }),
        assignRegistrationStatus: assign({
          isRegistered: (_, event) => event.data,
        }),
      },
      services: {
        checkRegistrationStatus,
        fetchGoogleDeviceService: (context) => {
          return fetchGoogleDevice(context.jwt)
        },
        signInWithGoogleService: (context, event) => {
          console.debug("AuthWithGoogleMachine signInWithGoogleService", {
            context,
            event,
          })
          return getGoogleAuthSession(event.data)
        },
      },
    },
  )

export type AuthWithGoogleActor = ActorRefFrom<typeof AuthWithGoogleMachine>

export default AuthWithGoogleMachine
