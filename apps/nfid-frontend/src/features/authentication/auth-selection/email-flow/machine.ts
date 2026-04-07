import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import toaster from "packages/ui/src/atoms/toast"
import type { DoneActorEvent, ErrorActorEvent } from "xstate"
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

type SendVerificationOutput = {
  keyPair: KeyPair
  requestId: string
  antiPhishingCode: string
}

type CheckEmailVerificationOutput = {
  identity: Ed25519KeyIdentity
  chainRoot: DelegationChain
  delegation: DelegationIdentity
}

export type Events =
  | { type: "End"; data: AuthWithEmailResult }
  | { type: "BACK" }
  | { type: "CONTINUE_VERIFIED" }
  | { type: "RESEND" }
  | DoneActorEvent<SendVerificationOutput, "sendVerificationEmail">
  | DoneActorEvent<CheckEmailVerificationOutput, "checkEmailVerification">
  | DoneActorEvent<AuthSession, "authorizeWithEmail">
  | ErrorActorEvent<unknown, "sendVerificationEmail">

type AuthWithEmailMachineTypes = {
  context: AuthWithEmailMachineContext
  events: Events
  input: Partial<AuthWithEmailMachineContext>
  output: AuthSession
}

const AuthWithEmailMachineConfig = {
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgdQJZYEkCBZAQwGNNcA7MAOgOvzSz0IIGIA5AUWwH0uAMQIARANoAGALqJQABwD2sfLkXU5IAB6IATLoCsdAOwA2AIwHjugCxXrlgDQgAnnqt0AHAE5PB08ae5rqS5t4AzAC+kc4sOPiYRGSUNPSMzBjx7Bw8ABoEAMoAKgRcAOKCIhIymkoq6GoaSNqI5uZekuGSkjaBNqa65j7ObggGnpJ0g779NpK63sY25tGxmWyJJBRUtAxM6HEbRBwAQsgAwgDSUrLNdarqmjoI+u2Sft42QeGffqYGI0QBjadF6A1MnlMvneQVWIEOCSS21SDAI5wATmBSOgwFwwAB3YRiDjnADyXF45yK-GwBCKAAl+MguOd6aSAEo3WrKB5NUDPUySUx0cIBIZDAw9f42QEIczhGx0bzK7y6TzhKwGFXGOEI9jJHZpNGY7G4glE0Qk8mU6m0hn8dk8MkANR47IAmly7jyGo9ms8fMLdKLVfM2pIVbKbMG6JZQhYbArJFYVjF4etEVsUrsiBisTi8YSqiTHcgijxBHwmSy2Zyat76o0nogNYqFW0wqZTMtJcZZVr2hDgZLBsFjBrdRn9cic8b82ai8SzlcvQofU3-XpPJ4vGrzInlcZVW1ZZ5jLGu-9PsZzMZOuEomm9ZsDSiiEUqOiIAAFUjo9AuBwEDqPQNAAG6KAA1vQKhQNQjBHIUYDomBuDkGAq4gPcvp8i0cqGJMATeAMPzEX4niyuECxKmeixDFCng2N45imJOrCZq+s7nOotDkAc1CUIo6JWhSTrUo6RQeph2EbvyrQEXQREkcqQ4Ua4rThOeTGHkKaoQqEj5rOx07Zka3HULx-GCcJy7XPWa6Nn6ckIGYO6MaKZ66P8AzAqeuhKiq26BIKzERGxWQvjOZk8WAfHIAJmBCdxEBgKcFx2bcDm8s2co-FpgzjomhjbuMp5GNpnz-HGbTGDqT5TpFpmouysWKGByEuN+mDoqQsCpY6LpuvwRD8AUACq5znDwBQFNJ65OXhwSSopR7KWRpXqS8Qy7vKvhQmq-h1UZEVIk1RAteQbUdV1PV9WlK72Vh824c8rleImELWN5hjmLKwbhEqZg-P4Bj+ExdVptQigpfAzTPqdhp7BkxmbNyjkvYg0ayr4F5drYia9MGAThYhnFmSaBbmlUaPZZuCCaeeWo+P95jdPKuhRjG1W9JpuiBGYR3pijCNvnSn4-n+AE0zhOU-MKYSQvo8ymOEEwAptxjLV8bQhH4Ni9FqJMcVFqLmZZ8XWdLsl4cR3gmFCTE-KrXxY5tzFeA+hj+JC-iLEbJmI7mMVxQlSXQ2AVsLc8caEaE0aSJr+0atjbYPuEwQ9BMEafP7jWBwQF1XeinXdb1EcNrTzkRMKWoq0KzOs1qf3Rh0xE+f4Y4GIZQsnVmiM8NQECRxjcqSrH+4hInqrJ5tGoA2CCz+ER242LnIu0MPOUALSirGtveAYgxd4EJ6bVvwrdJf7PdpKZ6eNE0RAA */
  initial: "SendVerificationEmail",
  id: "auth-with-email",
  states: {
    SendVerificationEmail: {
      invoke: {
        src: "sendVerificationEmail" as const,
        id: "sendVerificationEmail",
        input: ({ context }: { context: AuthWithEmailMachineContext }) =>
          context,
        onDone: {
          target: "PendingEmailVerification",
          actions: { type: "assignVerificationData" } as const,
        },
        onError: [
          {
            guard: { type: "isRequestNotExpired" } as const,
            target: "PendingEmailVerification",
            actions: { type: "toastError" } as const,
          },
          { target: "End", actions: { type: "toastError" } as const },
        ],
      },
    },
    PendingEmailVerification: {
      invoke: {
        src: "checkEmailVerification" as const,
        id: "checkEmailVerification",
        input: ({ context }: { context: AuthWithEmailMachineContext }) =>
          context,
        onDone: {
          target: "EmailVerified",
          actions: { type: "assignEmailDelegation" } as const,
        },
        onError: {
          target: "Error",
          actions: { type: "stopIntervalVerification" } as const,
        },
      },
      on: {
        BACK: {
          target: "End",
          actions: { type: "stopIntervalVerification" } as const,
        },
        RESEND: {
          target: "SendVerificationEmail",
          actions: { type: "stopIntervalVerification" } as const,
        },
      },
    },
    EmailVerified: {
      invoke: {
        src: "authorizeWithEmail" as const,
        id: "authorizeWithEmail",
        input: ({ context }: { context: AuthWithEmailMachineContext }) =>
          context,
        onDone: {
          target: "Authenticated",
          actions: { type: "assignAuthSession" } as const,
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
        context.authSession!,
    },
  },
}

const AuthWithEmailMachineOptions = {
  actions: {
    assignVerificationData: assign<
      AuthWithEmailMachineContext,
      Events,
      undefined,
      Events,
      any
    >(({ event }: { event: Events }) => ({
      keyPair: (
        event as DoneActorEvent<SendVerificationOutput, "sendVerificationEmail">
      ).output.keyPair,
      requestId: (
        event as DoneActorEvent<SendVerificationOutput, "sendVerificationEmail">
      ).output.requestId,
      antiPhishingCode: (
        event as DoneActorEvent<SendVerificationOutput, "sendVerificationEmail">
      ).output.antiPhishingCode,
    })),
    assignAuthSession: assign<
      AuthWithEmailMachineContext,
      Events,
      undefined,
      Events,
      any
    >(({ event }: { event: Events }) => ({
      authSession: (event as DoneActorEvent<AuthSession, "authorizeWithEmail">)
        .output,
    })),
    assignEmailDelegation: assign<
      AuthWithEmailMachineContext,
      Events,
      undefined,
      Events,
      any
    >(({ event }: { event: Events }) => ({
      emailDelegation: (
        event as DoneActorEvent<
          CheckEmailVerificationOutput,
          "checkEmailVerification"
        >
      ).output.identity,
      chainRoot: (
        event as DoneActorEvent<
          CheckEmailVerificationOutput,
          "checkEmailVerification"
        >
      ).output.chainRoot,
      delegation: (
        event as DoneActorEvent<
          CheckEmailVerificationOutput,
          "checkEmailVerification"
        >
      ).output.delegation,
    })),
    toastError: ({ event }: { event: Events }) => {
      if (typeof event !== "object" || event === null) return
      if (!("error" in event)) return
      try {
        const message = JSON.parse(
          String((event as { error: Error }).error.message),
        )
        toaster.error(message.error)
      } catch (_) {
        toaster.error(String((event as { error: Error }).error.message))
      }
    },
    stopIntervalVerification,
  },
  guards: {
    isRequestNotExpired: ({ event }: { event: Events }) => {
      if (typeof event !== "object" || event === null) return false
      if (!("error" in event)) return false
      return String(
        ((event as { error: Error }).error as Error | undefined)?.message ?? "",
      ).includes("Please wait for a minute!")
    },
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
  types: {} as AuthWithEmailMachineTypes,
  ...AuthWithEmailMachineOptions,
}).createMachine({
  ...AuthWithEmailMachineConfig,
  output: ({ context }: { context: AuthWithEmailMachineContext }) =>
    context.authSession!,
  context: ({ input }: { input?: Partial<AuthWithEmailMachineContext> }) =>
    ({
      verificationEmail: "",
      ...(input ?? {}),
    }) as AuthWithEmailMachineContext,
})

export type AuthWithEmailActor = ActorRefFrom<typeof AuthWithEmailMachine>

export default AuthWithEmailMachine
