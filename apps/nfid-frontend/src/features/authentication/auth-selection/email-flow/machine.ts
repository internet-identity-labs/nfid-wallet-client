import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@icp-sdk/core/identity"
import toaster from "packages/ui/src/atoms/toast"
import { setup, fromPromise, assign, sendParent, ActorRefFrom } from "xstate"

import { KeyPair } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"

import {
  checkEmailVerification,
  authorizeWithEmail,
  sendVerificationEmail,
  stopIntervalVerification,
} from "./services"

export interface AuthWithEmailMachineContext {
  authSession?: AuthSession
  verificationEmail: string
  keyPair?: KeyPair
  requestId?: string
  antiPhishingCode?: string
  emailDelegation?: Ed25519KeyIdentity
  chainRoot?: DelegationChain
  delegation?: DelegationIdentity
}

const AuthWithEmailMachine = setup({
  types: {} as {
    context: AuthWithEmailMachineContext
    input: {
      verificationEmail: string
      authRequest?: unknown
      appMeta?: unknown
    }
  },
  actors: {
    sendVerificationEmail: fromPromise(
      async ({ input }: { input: AuthWithEmailMachineContext }) =>
        sendVerificationEmail(input as any),
    ),
    checkEmailVerification: fromPromise(
      async ({ input }: { input: AuthWithEmailMachineContext }) =>
        checkEmailVerification(input as any),
    ),
    authorizeWithEmail: fromPromise(
      async ({ input }: { input: AuthWithEmailMachineContext }) =>
        authorizeWithEmail(input as any),
    ),
  },
  guards: {
    isRequestNotExpired: ({ event }: { event: any }) =>
      (event.error as Error).message.includes("Please wait for a minute!"),
  },
  actions: {
    assignVerificationData: assign(({ event }: { event: any }) => ({
      keyPair: event.output.keyPair,
      requestId: event.output.requestId,
      antiPhishingCode: event.output.antiPhishingCode,
    })),
    assignAuthSession: assign({
      authSession: ({ event }: { event: any }) => event.output as AuthSession,
    }),
    assignEmailDelegation: assign(({ event }: { event: any }) => ({
      emailDelegation: event.output.identity,
      chainRoot: event.output.chainRoot,
      delegation: event.output.delegation,
    })),
    toastError: ({ event }: { event: any }) => {
      try {
        const message = JSON.parse((event.error as Error).message)
        toaster.error(message.error)
      } catch (_) {
        toaster.error((event.error as Error).message)
      }
    },
    stopIntervalVerification,
    notifyParentComplete: sendParent(
      ({ context }: { context: AuthWithEmailMachineContext }) => ({
        type: "EMAIL_AUTH_COMPLETE",
        data: context.authSession,
      }),
    ),
  },
}).createMachine({
  id: "auth-with-email",
  context: ({ input }) => ({
    verificationEmail: input.verificationEmail,
  }),
  initial: "SendVerificationEmail",
  states: {
    SendVerificationEmail: {
      invoke: {
        src: "sendVerificationEmail",
        input: ({ context }) => context,
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
        input: ({ context }) => context,
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
        input: ({ context }) => context,
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
        CONTINUE_VERIFIED: {
          target: "End",
          actions: "notifyParentComplete",
        },
      },
    },
    End: {
      type: "final" as const,
      output: ({ context }) => context.authSession,
    },
  },
})

export type AuthWithEmailActor = ActorRefFrom<typeof AuthWithEmailMachine>

export default AuthWithEmailMachine
