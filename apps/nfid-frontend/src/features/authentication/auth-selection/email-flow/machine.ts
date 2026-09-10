import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@icp-sdk/core/identity"
import toaster from "packages/ui/src/atoms/toast"
import { ActorRefFrom, assign, createMachine, fromPromise } from "xstate"

import { KeyPair } from "@nfid/integration"

import { AuthSession, IIAuthSession } from "frontend/state/authentication"
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

const AuthWithEmailMachineConfig = {
  id: "auth-with-email",
  context: ({ input }: { input: any }) => input as AuthWithEmailMachineContext,
  initial: "SendVerificationEmail",
  states: {
    SendVerificationEmail: {
      invoke: {
        src: "sendVerificationEmail",
        id: "sendVerificationEmail",
        input: ({ context }: { context: AuthWithEmailMachineContext }) =>
          context,
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
        input: ({ context }: { context: AuthWithEmailMachineContext }) =>
          context,
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
        input: ({ context }: { context: AuthWithEmailMachineContext }) =>
          context,
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
      output: ({ context }: { context: AuthWithEmailMachineContext }) => {
        return context.authSession
      },
    },
  },
}

const AuthWithEmailMachineOptions = {
  actions: {
    assignVerificationData: assign(({ event }: { event: any }) => ({
      keyPair: event.output.keyPair,
      requestId: event.output.requestId,
      antiPhishingCode: event.output.antiPhishingCode,
    })),
    assignAuthSession: assign(({ event }: { event: any }) => ({
      authSession: event.output,
    })),
    assignEmailDelegation: assign(({ event }: { event: any }) => ({
      emailDelegation: event.output.identity,
      chainRoot: event.output.chainRoot,
      delegation: event.output.delegation,
    })),
    toastError: ({ event }: { event: any }) => {
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
    isRequestNotExpired: ({ event }: { event: any }) =>
      (event.error as Error).message.includes("Please wait for a minute!"),
  },
  actors: {
    sendVerificationEmail: fromPromise(
      ({ input }: { input: AuthWithEmailMachineContext }) =>
        sendVerificationEmail(input),
    ),
    checkEmailVerification: fromPromise(
      ({ input }: { input: AuthWithEmailMachineContext }) =>
        checkEmailVerification(input),
    ),
    authorizeWithEmail: fromPromise(
      ({ input }: { input: AuthWithEmailMachineContext }) =>
        authorizeWithEmail(input),
    ),
  },
}

const AuthWithEmailMachine = createMachine(
  AuthWithEmailMachineConfig,
  AuthWithEmailMachineOptions,
)

export type AuthWithEmailActor = ActorRefFrom<typeof AuthWithEmailMachine>

export default AuthWithEmailMachine
