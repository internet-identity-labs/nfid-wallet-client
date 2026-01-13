import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"

import { ActorRefFrom, assign, createMachine } from "xstate"

import { KeyPair } from "@nfid/integration"
import toaster from "@nfid/ui/atoms/toast"

import { AuthSession, IIAuthSession } from "frontend/state/authentication"

import {
  checkEmailVerification,
  authorizeWithEmail,
  sendVerificationEmail,
  stopIntervalVerification,
} from "./services"

export interface AuthWithEmailMachineContext {
  authSession?: AuthSession
  verificationEmail: string
  keyPair: KeyPair
  requestId: string
  emailDelegation?: Ed25519KeyIdentity
  chainRoot?: DelegationChain
  delegation: DelegationIdentity
}

export type Events =
  | { type: "End"; data: { authSession: IIAuthSession } }
  | { type: "BACK" }
  | { type: "CONTINUE_VERIFIED" }
  | { type: "RESEND" }
  | {
      type: "done.invoke.sendVerificationEmail"
      data: { keyPair: KeyPair; requestId: string }
    }
  | {
      type: "done.invoke.checkEmailVerification"
      data: any
    }
  | { type: "error.platform.sendVerificationEmail"; data: Error }
  | { type: "done.invoke.authorizeWithEmail"; data: AuthSession }

export interface Schema {
  events: Events
  context: AuthWithEmailMachineContext
}

const AuthWithEmailMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgdQJZYEkCBZAQwGNNcA7MAOgOvzSz0IIGIA5AUWwH0uAMQIARANoAGALqJQABwD2sfLkXU5IAB6IATLoCsdAOwA2AIwHjugCxXrlgDQgAnnqt0AHAE5PB08ae5rqS5t4AzAC+kc4sOPiYRGSUNPSMzBjx7Bw8ABoEAMoAKgRcAOKCIhIymkoq6GoaSNqI5uZekuGSkjaBNqa65j7ObggGnpJ0g779NpK63sY25tGxmWyJJBRUtAxM6HEbRBwAQsgAwgDSUrLNdarqmjoI+u2Sft42QeGffqYGI0QBjadF6A1MnlMvneQVWIEOCSS21SDAI5wATmBSOgwFwwAB3YRiDjnADyXF45yK-GwBCKAAl+MguOd6aSAEo3WrKB5NUDPUySUx0cIBIZDAw9f42QEIczhGx0bzK7y6TzhKwGFXGOEI9jJHZpNGY7G4glE0Qk8mU6m0hn8dk8MkANR47IAmly7jyGo9ms8fMLdKLVfM2pIVbKbMG6JZQhYbArJFYVjF4etEVsUrsiBisTi8YSqiTHcgijxBHwmSy2Zyat76o0nogNYqFW0wqZTMtJcZZVr2hDgZLBsFjBrdRn9cic8b82ai8SzlcvQofU3-XpPJ4vGrzInlcZVW1ZZ5jLGu-9PsZzMZOuEomm9ZsDSiiEUqOiIAAFUjo9AuBwEDqPQNAAG6KAA1vQKhQNQjBHIUYDomBuDkGAq4gPcvp8i0cqGJMATeAMPzEX4niyuECxKmeixDFCng2N45imJOrCZq+s7nOotDkAc1CUIo6JWhSTrUo6RQeph2EbvyrQEXQREkcqQ4Ua4rThOeTGHkKaoQqEj5rOx07Zka3HULx-GCcJy7XPWa6Nn6ckIGYO6MaKZ66P8AzAqeuhKiq26BIKzERGxWQvjOZk8WAfHIAJmBCdxEBgKcFx2bcDm8s2co-FpgzjomhjbuMp5GNpnz-HGbTGDqT5TpFpmouysWKGByEuN+mDoqQsCpY6LpuvwRD8AUACq5znDwBQFNJ65OXhwSSopR7KWRpXqS8Qy7vKvhQmq-h1UZEVIk1RAteQbUdV1PV9WlK72Vh824c8rleImELWN5hjmLKwbhEqZg-P4Bj+ExdVptQigpfAzTPqdhp7BkxmbNyjkvYg0ayr4F5drYia9MGAThYhnFmSaBbmlUaPZZuCCaeeWo+P95jdPKuhRjG1W9JpuiBGYR3pijCNvnSn4-n+AE0zhOU-MKYSQvo8ymOEEwAptxjLV8bQhH4Ni9FqJMcVFqLmZZ8XWdLsl4cR3gmFCTE-KrXxY5tzFeA+hj+JC-iLEbJmI7mMVxQlSXQ2AVsLc8caEaE0aSJr+0atjbYPuEwQ9BMEafP7jWBwQF1XeinXdb1EcNrTzkRMKWoq0KzOs1qf3Rh0xE+f4Y4GIZQsnVmiM8NQECRxjcqSrH+4hInqrJ5tGoA2CCz+ER242LnIu0MPOUALSirGtveAYgxd4EJ6bVvwrdJf7PdpKZ6eNE0RAA */
  createMachine(
    {
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      initial: "SendVerificationEmail",
      id: "auth-with-email",
      states: {
        SendVerificationEmail: {
          invoke: {
            src: "sendVerificationEmail",
            id: "sendVerificationEmail",
            onDone: {
              target: "PendingEmailVerification",
              actions: "assignVerificationData",
            },
            onError: [
              {
                cond: "isRequestNotExpired",
                target: "PendingEmailVerification",
                actions: "toastError",
              },
              { target: "End", actions: "toastError" },
            ],
          },
        },
        PendingEmailVerification: {
          invoke: {
            src: "checkEmailVerification",
            id: "checkEmailVerification",
            onDone: {
              target: "EmailVerified",
              actions: "assignEmailDelegation",
            },
            onError: {
              target: "Error",
              actions: "stopIntervalVerification",
            },
          },
          on: {
            BACK: {
              target: "End",
              actions: "stopIntervalVerification",
            },
            RESEND: {
              target: "SendVerificationEmail",
              actions: "stopIntervalVerification",
            },
          },
        },
        EmailVerified: {
          invoke: {
            src: "authorizeWithEmail",
            id: "authorizeWithEmail",
            onDone: {
              target: "Authenticated",
              actions: "assignAuthSession",
            },
            onError: {
              target: "Error",
            },
          },
        },
        Error: {
          on: {
            BACK: "End",
            RESEND: "SendVerificationEmail",
          },
        },
        Authenticated: {
          on: {
            CONTINUE_VERIFIED: "End",
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
        assignVerificationData: assign((_, event) => ({
          keyPair: event.data.keyPair,
          requestId: event.data.requestId,
        })),
        assignAuthSession: assign((_, event) => ({
          authSession: event.data,
        })),
        assignEmailDelegation: assign((_, event) => ({
          emailDelegation: event.data.identity,
          chainRoot: event.data.chainRoot,
          delegation: event.data.delegation,
        })),
        toastError: (_context, event) => {
          try {
            const message = JSON.parse(event.data.message)
            toaster.error(message.error)
          } catch (_) {
            toaster.error(event.data.message)
          }
        },
        stopIntervalVerification,
      },
      guards: {
        isRequestNotExpired: (_context, event: { data: Error }) => {
          return event.data.message.includes("Please wait for a minute!")
        },
      },
      services: {
        sendVerificationEmail,
        checkEmailVerification,
        authorizeWithEmail,
      },
    },
  )

export type AuthWithEmailActor = ActorRefFrom<typeof AuthWithEmailMachine>

export default AuthWithEmailMachine
