import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from "@dfinity/identity"
import toaster from "packages/ui/src/atoms/toast"
import { ActorRefFrom, assign, createMachine, fromPromise } from "xstate"

import { KeyPair } from "@nfid/integration"

import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

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
  authRequest?: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
}

export type EmailMachineInput = {
  authRequest?: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
  verificationEmail: string
}

const AuthWithEmailMachine = createMachine(
  {
    types: {
      context: {} as AuthWithEmailMachineContext,
      input: {} as EmailMachineInput | undefined,
    },
    initial: "SendVerificationEmail",
    id: "auth-with-email",
    context: ({ input }: { input?: EmailMachineInput }) =>
      ({
        verificationEmail: input?.verificationEmail ?? "",
        authRequest: input?.authRequest,
        appMeta: input?.appMeta,
        keyPair: undefined as unknown as KeyPair,
        requestId: "",
        delegation: undefined as unknown as DelegationIdentity,
      }) as AuthWithEmailMachineContext,
    output: ({ context: ctx }) => ctx.authSession,
    states: {
      SendVerificationEmail: {
        invoke: {
          src: "sendVerificationEmail",
          id: "sendVerificationEmail",
          input: ({ context: ctx }) => ctx,
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
          input: ({ context: ctx }) => ctx,
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
          input: ({ context: ctx }) => ctx,
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
        output: ({ context: ctx }) => ctx.authSession,
      },
    },
  },
  {
    actions: {
      assignVerificationData: assign(({ event }) => {
        const out = (
          event as unknown as {
            output: {
              keyPair: KeyPair
              requestId: string
              antiPhishingCode: string
            }
          }
        ).output
        return {
          keyPair: out.keyPair,
          requestId: out.requestId,
          antiPhishingCode: out.antiPhishingCode,
        }
      }),
      assignAuthSession: assign(({ event }) => {
        const e = event as unknown as {
          output?: AuthSession
          data?: AuthSession
        }
        return { authSession: e.output ?? e.data }
      }),
      assignEmailDelegation: assign(({ event }) => {
        const out = (
          event as unknown as {
            output: {
              identity: Ed25519KeyIdentity
              chainRoot: DelegationChain
              delegation: DelegationIdentity
            }
          }
        ).output
        return {
          emailDelegation: out.identity,
          chainRoot: out.chainRoot,
          delegation: out.delegation,
        }
      }),
      toastError: ({ event }) => {
        const err = (event as { error?: Error }).error ?? new Error("Unknown")
        try {
          const message = JSON.parse((err as Error).message)
          toaster.error(message.error)
        } catch {
          toaster.error((err as Error).message)
        }
      },
      stopIntervalVerification,
    },
    guards: {
      isRequestNotExpired: ({ event }) => {
        const err = (event as { error?: Error }).error
        return !!err?.message?.includes("Please wait for a minute!")
      },
    },
    actors: {
      sendVerificationEmail: fromPromise(({ input }) =>
        sendVerificationEmail(input as AuthWithEmailMachineContext),
      ),
      checkEmailVerification: fromPromise(({ input }) =>
        checkEmailVerification(input as AuthWithEmailMachineContext),
      ),
      authorizeWithEmail: fromPromise(({ input }) =>
        authorizeWithEmail(input as AuthWithEmailMachineContext),
      ),
    },
  },
)

export type AuthWithEmailActor = ActorRefFrom<typeof AuthWithEmailMachine>

export default AuthWithEmailMachine
