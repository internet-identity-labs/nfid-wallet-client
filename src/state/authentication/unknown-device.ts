import { DelegationIdentity } from "@dfinity/identity"
import { ActorRefFrom, assign, createMachine, send } from "xstate"

import { fetchGoogleDevice } from "frontend/integration/lambda-google"

import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"

export interface Context {
  signIdentity?: DelegationIdentity
  googleIdentityExists?: boolean
}

export type Events =
  | {
      type: "AUTH_WITH_GOOGLE"
      data: string
    }
  | { type: "done.invoke.remote"; data: DelegationIdentity }
  | { type: "done.invoke.registration"; data: DelegationIdentity }
  | {
      type: "done.invoke.fetchGoogle"
      data: { isExisting: boolean; identity: DelegationIdentity }
    }
  | { type: "AUTH_WITH_REMOTE" }
  | { type: "AUTH_WITH_OTHER" }
  | { type: "TRUST_DEVICE" }
  | { type: "DONT_TRUST_DEVICE" }
  | { type: "INGEST_SIGN_IDENTITY"; data: DelegationIdentity }
  | { type: "DONE"; data: DelegationIdentity }
  | { type: "REGISTER"; data: DelegationIdentity }

export interface Schema {
  events: Events
  context: Context
}

function isMobileWithWebAuthn() {
  // Integration layer note: run async capability check initially and capture to memory.
  // Maybe make this an invokation to deal with async, while Philipp is sleeping.
  return false
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3QGJFQAHYrFrpaxPHxAAPRABYAzAA4migAwBWAGyrtAdgCMuzet2yANCACeiAEzqbTY6vnzNATn03Vs9QF9fFmhYuIQk5JQ0DMwASmBQtLDoHMii4gCyyPSYtHhg3BDizDnUxATMHHEJSSliEkgggsKpdaAyCPpusm5M8gq6ippdmko28hbWCDYGTOqqc6r6C-JTiop+ASBBOPhEZBRUdIxMAIIYmCxgADZg9M3cxwCqACoAEgD6AOoAkq9vAOIAeQBfwAMgBRSSNES1SRtUbKPrqHz6RSdNw6TTjOSafRMeaqGyKBT6WT6dTrQJnEK7cIHKInM4Xa63Wr3Z7vb6-aJgtIAp4Q+pQ5qw2xKJiI5GoroYrEITSDFQueQmLRdfTyNz+SnBHZhfaRI6nLBMm53R6-TnvPkvMHRSFCaHiEWTMUS9QotEyqyIfSLGb4myaXRuDyDLWbKm6vYRQ7MI2YD4iTB-YjEKDXfKFJjFUrMKCp9Nge1NGH1NqKQxMLzydWyRTyBYV8zehCyUn+uY2dGqDw2LyycNbal6mP0lNp66xeKJMAcAAiN1oVA4vEFDuFZZ9XfUVd6CmJnh06llsjmePxWl6bhr8kHkdC0bpR1iAFtiOgwPGwHhRPQauJM1ybM8BKMomAqN8P2LR0WmkRAK10KtnFretGxJWVBh3JVXBrU8bFPTQ7x1B9aQNGJKhnecyIXegl1nbg5wBAA5J43ieaIHhYVi5zBAA1L4AGEBQEddS1aLc3B3UY216GtD2MWUTFUc85jrTRRmGewiO2Ej9VjJgpyqWcF1jGi6JXdjOO4vjBOEhpRKdTd2m3XcZIPLwFJbIN5BUgkPNMXRlW04dHzIgyKI-KjY0AooQNzJghyjUj9MMyiTKiBAcz-ZoAG1VAAXWgjdxPaNEej6AYhhGMYW10GxcXxDUfFcVFNQ2RLdNHZ8IuMsjuFnDhiA4Jh+EuFIADMhpfBL7xpPT6VSyL0sYTK4uy2o8sKtcS0ckrFncGYkSMNtArWYNZTq3FZjmGsphxBsB3a2aRyfcjpyWsiwQ4QaLI4ri3h4-ihKKsS4OcyTXP3OSPOPFtFFGXzllWNQe30YKkvm7r3t62Mvp+7gwSYucQd2sHPAh6Sod9GHZUUaZ8UWLtlmGXR0c616mDBKQqhyKBjjwLIhu4L4mL+MF-pYL4-iYt4vh4lifgATRJ2Dy0rasUIbFF0JbDxfIJOZ4cMNxCPDEgqHgeoOrmrrmDYTh0BV51+mUnt6zcIk3EJAZYYmFEsKJJR+lkHEjHkVmnuIm2ObBPAICdpz6rqlRvDq4YFGR5sJi0ZSSUJYNvEDd0I+1HTo7CxbkmaDIshyIttpg50yWDFRdFmcPTCvLpZTsbprpuhsTGMGw2fL-T4xNFlSaFUG2lkGwMJDmZ63D9QQycR7S5C5L6XjRMsHHQsE5KkOHEWa90VkfoBl0UwTy7DtnHUkM+zWCkIyjl6wsPyceqo2jlzHzJs4Hcqg1idDql4POJ5yS+XVMMam4dR5fxSmASCn4zjfl-P+WCM9SZzzbDMW6BhehhymL7RAwwfLYXJH0NS79rYoIWn-ZaYAzKAIbsVYByo8TgKvn2BY88MLqGUCvcO5DnD7mQaFVB2MopRCAW0fQOJcS6A0IsckOIr7DAwqiR+4dmaBjsNIneWMjLyMYHjIaiifQaFkD0QkKJehBhMGSWm7pH753wmsJQJjMbMC5jzPAfMBaYGsZw2eiB1DLDxCHVYgU3C33lPoWUix7H9wWOpBsagph+NtjY9oihUmIRDCGeGqh+jh0Zv4fwQA */
  createMachine(
    {
      tsTypes: {} as import("./unknown-device.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      context: {},
      id: "auth-unknown-device",
      initial: "Start",
      states: {
        Start: {
          always: [
            {
              cond: "isMobileWithWebAuthn",
              target: "RegistrationMachine",
            },
            {
              target: "AuthSelection",
            },
          ],
        },
        End: {
          type: "final",
          data: (context) => context.signIdentity,
        },
        RegistrationMachine: {
          invoke: {
            src: "RegistrationMachine",
            id: "registration",
            onDone: [
              {
                actions: "ingestSignIdentity",
                target: "End",
              },
            ],
          },
        },
        AuthSelection: {
          on: {
            AUTH_WITH_GOOGLE: {
              target: "AuthWithGoogle",
            },
            AUTH_WITH_REMOTE: {
              target: "RemoteAuthentication",
            },
            AUTH_WITH_OTHER: {
              target: "ExistingAnchor",
            },
          },
        },
        AuthWithGoogle: {
          invoke: {
            src: "fetchGoogleDevice",
            id: "fetchGoogle",
            onExit: "ingestGoogle",
            onDone: {
              actions: ["ingestGoogle", "handleGoogle"],
            },
          },
          on: {
            DONE: "End",
            REGISTER: "RegistrationMachine",
          },
        },
        RemoteAuthentication: {
          invoke: {
            src: "RemoteReceiverMachine",
            id: "remote",
            onDone: [
              {
                actions: "ingestSignIdentity",
                target: "RegisterDeviceDecider",
              },
            ],
          },
        },
        RegisterDeviceDecider: {
          on: {
            DONT_TRUST_DEVICE: {
              target: "End",
            },
            TRUST_DEVICE: {
              target: "RegisterDevice",
            },
          },
        },
        RegisterDevice: {
          invoke: {
            src: "registerDevice",
            onDone: [
              {
                target: "End",
              },
            ],
            onError: [
              {
                target: "RegisterDeviceError",
              },
            ],
          },
        },
        RegisterDeviceError: {
          on: {
            TRUST_DEVICE: {
              target: "RegisterDevice",
            },
            END: {
              target: "End",
            },
          },
        },
        ExistingAnchor: {
          on: {
            INGEST_SIGN_IDENTITY: {
              actions: "ingestSignIdentity",
              target: "End",
            },
            AUTH_WITH_OTHER: "AuthSelection",
          },
        },
      },
    },
    {
      guards: {
        isMobileWithWebAuthn,
        googleIdentityExists(context) {
          return context.googleIdentityExists === true
        },
      },
      actions: {
        ingestGoogle: assign((context, event) => ({
          signIdentity: event.data.identity,
          googleIdentityExists: event.data.isExisting,
        })),
        handleGoogle: send((context, event) => ({
          type: event.data.isExisting ? "DONE" : "REGISTER",
          data: event.data.identity,
        })),
        ingestSignIdentity: assign({
          signIdentity: (context, event) => event.data,
        }),
      },
      services: {
        RegistrationMachine,
        RemoteReceiverMachine,
        fetchGoogleDevice: (context, event) => fetchGoogleDevice(event.data),
      },
    },
  )

export type UnknownDeviceActor = ActorRefFrom<typeof UnknownDeviceMachine>
export default UnknownDeviceMachine
