// State machine controlling the phone number credential flow.
import {
  CredentialResult,
  registerPhoneNumberCredentialHandler,
} from "@nfid/credentials"
import { ActorRefFrom, assign, createMachine } from "xstate"

import { fetchProfile } from "frontend/integration/identity-manager"
import {
  verifyPhoneNumberService,
  verifySmsService,
} from "frontend/integration/identity-manager/services"
import { verifyPhoneNumber as _verifyPhoneNumber } from "frontend/integration/lambda/phone"
import { AuthorizingAppMeta } from "frontend/state/authorization"
import AuthenticationMachine, {
  AuthenticationMachineContext,
} from "frontend/state/machines/authentication/authentication"

// State local to the machine.
interface Context {
  phone?: string
  encryptedPN?: string
  appMeta: AuthorizingAppMeta
}

let credentialResult: CredentialResult

// Definition of events usable in the machine.
type Events =
  | {
      type: "done.invoke.AuthenticationMachine"
      data: AuthenticationMachineContext
    }
  | {
      type: "done.invoke.fetchPhoneNumber"
      data: string | undefined
    }
  | {
      type: "done.invoke.verifySmsService"
      data: boolean
    }
  | {
      type: "error.platform.verifySmsService"
      data: { error: string }
    }
  | {
      type: "done.invoke.verifyPhoneNumberService"
      data: string
    }
  | {
      type: "error.platform.verifyPhoneNumberService"
      data: { error: string }
    }
  | { type: "ENTER_PHONE_NUMBER"; data: string }
  | { type: "ENTER_SMS_TOKEN"; data: string }
  | { type: "CHANGE_PHONE_NUMBER" }
  | { type: "RESEND"; data: string }

// The machine. Install xstate vscode extension for best results.
/** @xstate-layout N4IgpgJg5mDOIC5QAUAWB7AdmAcgVwFsAjMAJwGFTIxMAXASwEMAbZU9AN3ojIDoBBPLVQ0GAY0a0wAYghYwvepg7oA1gsHDR9CQywBZRmNRKwiUAAd0senszmQAD0QBGAAwAWXi4DsAZgA2Pz8ATgC3NwCAJiiQgBoQAE9EDxco3gAOEJcAkOyfDOCAVgyAX1KEtHl8YjJKajomVnYuHlJeAHEwWirsGpJ2rtoAUUd6WAZMKF7cQgHZeUVlNQUZ-rqqHkaWNk5uPiG1uYPu0fHJ6Yw+49IEJRVdeiwAbTcAXQcrGzsHZwQXQq8KKpAIBIpRHw+DwZSEJZIIHxRNxAjwBNI+FwuPxRYJ+cqVK6zWoUTbaHYtfaDbpHYm8YZ0Mg0+bDHAAFWGACUAPrIAASAHkcMMuTgAKr6ABCnM+1lsT3sSCciGCXhCWSKbhKLg8bghRSKcNcuq8mKKIVRwI8ULcLnxICZGwaDHJezanWphPW7XpUlIAGV9H7WStMNIyOx2hZmJIAGboUgEXgOklOpq7VonHqem50hn+wPB9SYO7LR4vd4y77yhzwzFRAK8VF+Io+Er1twhHwJP7QlzeGIBLIhY0du3J+pbZ3NV2Z5O530BoMh6TkXn8HAdYV8wXCsWS6WKr5yrC-FINwJQtVFaIZDzmvweQ3-Tx+XjhMHAh9uDJRDIBMfZsSE5ktOGZUlm1Q5j6ZCLoWNDSCy7LcouXKsvyADSLKVseCqgH8vh9kUaR3u4OppMCGRPmk17eFCHhWhiBTDh4AGQUBpLbKBlLuhB1y0gAaiw3CSGAsHLnI2BLCo6i8BwZD0DGiR+gQsB+mQXBiGYh6yj8ip-NeDYhNeGSFDiaKagaSSuHePiZD+ITNp4171j4rF8QMwGcem3GHIBAy8IJzDCVIYlFmGpARrwUaxvGiZyaQClKSpamkBpWmWDp1Z6a4r5qg5AIuMxviRAEVGBBkvCthqaLZAE-gAm5RIeRxU7eW6vKMJgEDMGAnlTrwHJwOgzByX1TQDd0CVgHJAAiYA9VAIkLJJ9wrEmfmOpOaYUu1nXdb1LXjYNsDDaNh0sBNtBTbN81gItUglg8kjyq8HzaVWJ7Zf87jIi20QxNCt5gqVVkINkyI-iZmqxKEGp4hU9obSmW0umBvAdV1PVjRdx2nQdqY40NI1gHBoYSQoq0yeO51cbtmP4yjzATSdxPY0zuPE6Tj3oGWmCvdhul4Ygf7Ih4OI5FELZuM2t5UTaIS8IEVqkX4WQeEULF2pg6A8PAirUwTtN8JoIiNLo6UgEegtKggfi2bEPjSyZqJ-tifhPpLCtQxrjv1RiRSNV6bNtbOSM8WcExKJcbEDALWVC-8GJvhr2qeFiMIgk+4SvhEkShMCaLZ4HNzBztocx3w0GkMmcefQnUTaorPjZ9LkRmhElnwkZ6Ri+EELtlirkIwbjMh+Bc5V6FNC17hNvFZVORBD+oIr83VFpA2TYtm24SdsX7GG2PPFzoFwWiQWIYz6e-yAg5wIxL4Dk+1EVEkbwER+J4v7anVIRRPvzVD5l3HkjK+X0AC07h37uEHACDsbYHKPlBkUPwfYbQfwKMELImIAGbRAkfDG+02bMzxsQwaV16DTTAHNBaIkwEJx-K+VBzdsiP1SEg+EWRkR1TtnVO8v4YQB2HkjUuM52iEKxjTEhrMpEczkqTehc8YHvzVJCP8P9xZy0iJkAILt3BGTSG4IeBIK7I3wcA9Ge1JGG2kWdQ2ii-g+DyIrXwuRMROPYU+DIAI3yFExNiXUsNjGI1MaItGEiGYgSTFQWAog2YOOFhCRWuiWw-yxLqLsoNTTIlQc2bIwRGK6NwWYryFiInxPejha+kIiguJYe4802onxQgbLkYEw4bR8NHMI0JNMx4JIQOAh80DIjeIyPA+yD4qIwjsnkHEJlWyL3huUIAA */
const PhoneCredentialMachine = createMachine(
  {
    context: {} as Context,
    tsTypes: {} as import("./phone-credential.typegen").Typegen0,
    schema: { events: {} as Events },
    id: "PhoneNumberCredentialProvider",
    initial: "Ready",
    states: {
      Ready: {
        entry: () => {
          registerPhoneNumberCredentialHandler(function () {
            return new Promise((resolve) => {
              setInterval(
                () => credentialResult && resolve(credentialResult),
                1000,
              )
            })
          })
        },
        always: "Authenticate",
      },
      Authenticate: {
        invoke: {
          src: "AuthenticationMachine",
          id: "AuthenticationMachine",
          onDone: [
            {
              actions: "assignAuthSession",
              target: "GetPhoneNumber",
            },
          ],
          data: (context) => ({
            appMeta: context.appMeta,
          }),
        },
      },
      GetPhoneNumber: {
        initial: "GetExistingPhoneNumber",
        states: {
          GetExistingPhoneNumber: {
            invoke: {
              src: "fetchPhoneNumber",
              id: "fetchPhoneNumber",
              onDone: [
                {
                  actions: "assignEncryptedPN",
                  cond: "defined",
                  target: "#PhoneNumberCredentialProvider.PresentCredential",
                },
                { target: "EnterPhoneNumber" },
              ],
            },
          },
          EnterPhoneNumber: {
            on: {
              ENTER_PHONE_NUMBER: {
                actions: "assignPhoneNumber",
                target: "VerifyPhoneNumber",
              },
            },
          },
          VerifyPhoneNumber: {
            invoke: {
              src: "verifyPhoneNumberService",
              id: "verifyPhoneNumberService",
              onError: "EnterPhoneNumber",
              onDone: {
                target: "EnterSMSToken",
                actions: "assignEncryptedPN",
              },
            },
          },
          EnterSMSToken: {
            on: {
              CHANGE_PHONE_NUMBER: "EnterPhoneNumber",
              ENTER_SMS_TOKEN: "ValidateSMSToken",
              RESEND: "VerifyPhoneNumber",
            },
          },
          ValidateSMSToken: {
            invoke: {
              src: "verifySmsService",
              id: "verifySmsService",
              onDone: [
                {
                  cond: "bool",
                  target: "#PhoneNumberCredentialProvider.PresentCredential",
                },
                { target: "EnterSMSToken" },
              ],
              onError: "EnterSMSToken",
            },
          },
        },
      },
      PresentCredential: {
        entry: "presentCredential",
        type: "final",
      },
    },
  },
  {
    actions: {
      assignPhoneNumber: assign((_, { data }) => ({ phone: data })),
      assignEncryptedPN: assign((_, event) => ({ encryptedPN: event.data })),
      presentCredential: (context) => {
        if (!context.encryptedPN) throw new Error("Missing credential")
        credentialResult = {
          credential: context.encryptedPN,
          result: true,
        }
      },
    },
    services: {
      async fetchPhoneNumber() {
        const account = await fetchProfile()
        return account.phoneNumber
      },
      verifyPhoneNumberService,
      verifySmsService,
      AuthenticationMachine,
    },
    guards: {
      defined(_, { data }: { data: unknown | undefined }) {
        return data !== undefined
      },
      bool(_, { data }: { data: boolean }) {
        return data
      },
    },
  },
)

export default PhoneCredentialMachine

export type PhoneCredentialActor = ActorRefFrom<typeof PhoneCredentialMachine>
export type PhoneCredentialType = typeof PhoneCredentialMachine
