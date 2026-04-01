import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import toaster from "packages/ui/src/atoms/toast"
import { ActorRefFrom, assign, fromPromise, setup } from "xstate"

import { KeyPair } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import { AuthWithEmailResult } from "../../auth-types"

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
  antiPhishingCode?: string
  emailDelegation?: Ed25519KeyIdentity
  chainRoot?: DelegationChain
  delegation: DelegationIdentity
}

export type Events =
  | { type: "End"; data: AuthWithEmailResult }
  | { type: "BACK" }
  | { type: "CONTINUE_VERIFIED" }
  | { type: "RESEND" }
  | {
      type: "done.invoke.sendVerificationEmail"
      data: { keyPair: KeyPair; requestId: string; antiPhishingCode: string }
    }
  | {
      type: "done.invoke.checkEmailVerification"
      data: any
    }
  | { type: "error.platform.sendVerificationEmail"; data: Error }
  | { type: "done.invoke.authorizeWithEmail"; data: AuthSession }

const AuthWithEmailMachineConfig = {
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgdQJZYEkCBZAQwGNNcA7MAOgOvzSz0IIGIA5AUWwH0uAMQIARANoAGALqJQABwD2sfLkXU5IAB6IATLoCsdAOwA2AIwHjugCxXrlgDQgAnnqt0AHAE5PB08ae5rqS5t4AzAC+kc4sOPiYRGSUNPSMzBjx7Bw8ABoEAMoAKgRcAOKCIhIymkoq6GoaSNqI5uZekuGSkjaBNqa65j7ObggGnpJ0g779NpK63sY25tGxmWyJJBRUtAxM6HEbRBwAQsgAwgDSUrLNdarqmjoI+u2Sft42QeGffqYGI0QBjadF6A1MnlMvneQVWIEOCSS21SDAI5wATmBSOgwFwwAB3YRiDjnADyXF45yK-GwBCKAAl+MguOd6aSAEo3WrKB5NUDPUySUx0cIBIZDAw9f42QEIczhGx0bzK7y6TzhKwGFXGOEI9jJHZpNGY7G4glE0Qk8mU6m0hn8dk8MkANR47IAmly7jyGo9ms8fMLdKLVfM2pIVbKbMG6JZQhYbArJFYVjF4etEVsUrsiBisTi8YSqiTHcgijxBHwmSy2Zyat76o0nogNYqFW0wqZTMtJcZZVr2hDgZLBsFjBrdRn9cic8b82ai8SzlcvQofU3-XpPJ4vGrzInlcZVW1ZZ5jLGu-9PsZzMZOuEomm9ZsDSiiEUqOiIAAFUjo9AuBwEDqPQNAAG6KAA1vQKhQNQjBHIUYDomBuDkGAq4gPcvp8i0cqGJMATeAMPzEX4niyuECxKmeixDFCng2N45imJOrCZq+s7nOotDkAc1CUIo6JWhSTrUo6RQeph2EbvyrQEXQREkcqQ4Ua4rThOeTGHkKaoQqEj5rOx07Zka3HULx-GCcJy7XPWa6Nn6ckIGYO6MaKZ66P8AzAqeuhKiq26BIKzERGxWQvjOZk8WAfHIAJmBCdxEBgKcFx2bcDm8s2co-FpgzjomhjbuMp5GNpnz-HGbTGDqT5TpFpmouysWKGByEuN+mDoqQsCpY6LpuvwRD8AUACq5znDwBQFNJ65OXhwSSopR7KWRpXqS8Qy7vKvhQmq-h1UZEVIk1RAteQbUdV1PV9WlK72Vh824c8rleImELWN5hjmLKwbhEqZg-P4Bj+ExdVptQigpfAzTPqdhp7BkxmbNyjkvYg0ayr4F5drYia9MGAThYhnFmSaBbmlUaPZZuCCaeeWo+P95jdPKuhRjG1W9JpuiBGYR3pijCNvnSn4-n+AE0zhOU-MKYSQvo8ymOEEwAptxjLV8bQhH4Ni9FqJMcVFqLmZZ8XWdLsl4cR3gmFCTE-KrXxY5tzFeA+hj+JC-iLEbJmI7mMVxQlSXQ2AVsLc8caEaE0aSJr+0atjbYPuEwQ9BMEafP7jWBwQF1XeinXdb1EcNrTzkRMKWoq0KzOs1qf3Rh0xE+f4Y4GIZQsnVmiM8NQECRxjcqSrH+4hInqrJ5tGoA2CCz+ER242LnIu0MPOUALSirGtveAYgxd4EJ6bVvwrdJf7PdpKZ6eNE0RAA */
  initial: "SendVerificationEmail",
  id: "auth-with-email",
  states: {
    SendVerificationEmail: {
      invoke: {
        src: "sendVerificationEmail",
        id: "sendVerificationEmail",
        input: (args: any) => args.context,
        onDone: {
          target: "PendingEmailVerification",
          actions: "assignVerificationData",
        },
        onError: [
          {
            guard: "isRequestNotExpired",
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
        input: (args: any) => args.context,
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
        input: (args: any) => args.context,
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
      type: "final" as const,
      output: ({ context }: { context: AuthWithEmailMachineContext }) =>
        context.authSession,
    },
  },
}

const AuthWithEmailMachineOptions = {
  actions: {
    assignVerificationData: assign(({ event }: any) => ({
      keyPair: event.output.keyPair,
      requestId: event.output.requestId,
      antiPhishingCode: event.output.antiPhishingCode,
    })),
    assignAuthSession: assign(({ event }: any) => ({
      authSession: event.output,
    })),
    assignEmailDelegation: assign(({ event }: any) => ({
      emailDelegation: event.output.identity,
      chainRoot: event.output.chainRoot,
      delegation: event.output.delegation,
    })),
    toastError: ({ event }: any) => {
      try {
        const message = JSON.parse(event.error.message)
        toaster.error(message.error)
      } catch (_) {
        toaster.error(event.error.message)
      }
    },
    stopIntervalVerification,
  },
  guards: {
    isRequestNotExpired: ({ event }: any) =>
      String((event?.error as Error | undefined)?.message ?? "").includes(
        "Please wait for a minute!",
      ),
  },
  actors: {
    sendVerificationEmail: fromPromise(
      async ({ input }: { input: AuthWithEmailMachineContext }) =>
        sendVerificationEmail(input),
    ),
    checkEmailVerification: fromPromise(
      async ({ input }: { input: AuthWithEmailMachineContext }) =>
        checkEmailVerification(input),
    ),
    authorizeWithEmail: fromPromise(
      async ({ input }: { input: AuthWithEmailMachineContext }) =>
        authorizeWithEmail(input),
    ),
  },
}

const AuthWithEmailMachine = setup({
  types: {} as any,
  ...AuthWithEmailMachineOptions,
} as any).createMachine({
  ...AuthWithEmailMachineConfig,
  context: (args: any) =>
    ({
      verificationEmail: "",
      ...(args.input ?? {}),
    }) as AuthWithEmailMachineContext,
} as any)

export type AuthWithEmailActor = ActorRefFrom<typeof AuthWithEmailMachine>

export default AuthWithEmailMachine
