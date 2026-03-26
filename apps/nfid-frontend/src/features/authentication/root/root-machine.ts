import { ActorRefFrom, assign, createMachine, fromPromise } from "xstate"

import AuthWithEmailMachine from "frontend/features/authentication/auth-selection/email-flow/machine"
import AuthWithGoogleMachine from "frontend/features/authentication/auth-selection/google-flow/auth-with-google"
import { AbstractAuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { ApproveIcGetDelegationSdkResponse } from "../3rd-party/choose-account/types"
import {
  checkIf2FAEnabled,
  shouldShowPasskeys,
  shouldShowPasskeysEvery6thTime,
  shouldShowRecoveryPhraseEvery8thTime,
} from "../services"
import { signWithIIService } from "../auth-selection/ii-flow/ii-auth.service"

export interface AuthenticationContext {
  verificationEmail?: string
  authRequest?: AuthorizationRequest
  appMeta?: AuthorizingAppMeta

  authSession?: AbstractAuthSession
  error?: Error

  selectedPersonaId?: number
  thirdPartyAuthSession?: ApproveIcGetDelegationSdkResponse

  allowedDevices?: string[]

  email2FA?: string
  email?: string
  walletName?: string
  anchor?: number
  showPasskeys?: boolean
  showRecovery?: boolean
  isEmbed?: boolean
  shouldShowRecoveryEvery8th?: boolean
}

export type Events =
  | { type: "AUTH_WITH_EMAIL"; data: { email: string; isEmbed: boolean } }
  | { type: "CHOOSE_WALLET" }
  | {
      type: "AUTH_WITH_GOOGLE"
      data: { jwt: string; email: string; isEmbed: boolean }
    }
  | {
      type: "AUTH_WITH_II"
      data?: AbstractAuthSession
    }
  | { type: "AUTH_WITH_OTHER"; data: { isEmbed: boolean } }
  | { type: "AUTH_WITH_RECOVERY_PHRASE" }
  | {
      type: "AUTHENTICATED"
      data?: AbstractAuthSession
    }
  | { type: "BACK" }
  | { type: "CONTINUE" }
  | { type: "SKIP" }
  | { type: "DONE" }
  | { type: "SIGN_UP" }
  | { type: "SIGN_IN" }
  | { type: "SIGN_UP_WITH_PASSKEY" }
  | {
      type: "SIGN_IN_PASSKEY"
      data?: AbstractAuthSession
    }

function doneOutput<T>(event: unknown): T | undefined {
  const e = event as { output?: T; data?: T }
  return e.output ?? e.data
}

const AuthenticationMachine = createMachine(
  {
    id: "auth-machine",
    initial: "AuthSelection",
    context: ({ input }: { input?: Partial<AuthenticationContext> }) =>
      ({
        ...(input ?? {}),
      }) as AuthenticationContext,
    states: {
      AuthSelection: {
        on: {
          AUTH_WITH_EMAIL: {
            target: "EmailAuthentication",
            actions: ["assignVerificationEmail", "assignIsEmbed"],
          },
          AUTH_WITH_GOOGLE: {
            target: "AuthWithGoogle",
            actions: ["assignEmail", "assignIsEmbed"],
          },
          AUTH_WITH_II: {
            target: "AuthWithII",
            actions: "assignAuthSession",
          },
          AUTH_WITH_OTHER: {
            target: "OtherSignOptions",
            actions: "assignIsEmbed",
          },
          AUTHENTICATED: {
            actions: "assignAuthSession",
            target: "End",
          },
          SIGN_UP: {
            target: "AuthSelectionSignUp",
          },
          SIGN_IN_PASSKEY: {
            actions: "assignAuthSession",
            target: "checkRecovery8th",
          },
        },
      },
      AuthSelectionSignUp: {
        on: {
          AUTH_WITH_EMAIL: {
            target: "SignUpWithEmail",
            actions: ["assignVerificationEmail", "assignIsEmbed"],
          },
          AUTH_WITH_GOOGLE: {
            target: "SignUpWithGoogle",
            actions: ["assignEmail", "assignIsEmbed"],
          },
          AUTH_WITH_II: {
            target: "SignUpWithII",
            actions: "assignAuthSession",
          },
          AUTHENTICATED: {
            actions: "assignAuthSession",
            target: "End",
          },
          SIGN_IN: {
            target: "AuthSelection",
          },
          SIGN_UP_WITH_PASSKEY: {
            target: "SignUpPassKey",
          },
        },
      },
      SignUpPassKey: {
        on: {
          BACK: "AuthSelectionSignUp",
          AUTHENTICATED: {
            target: "End",
            actions: "assignAuthSession",
          },
        },
      },
      SignInWithRecoveryPhrase: {
        on: {
          BACK: "OtherSignOptions",
          AUTHENTICATED: {
            target: "checkPasskeys6th",
            actions: "assignAuthSession",
          },
        },
      },
      BackupWallet: {
        on: {
          SKIP: {
            target: "End",
          },
          DONE: "BackupWalletSavePhrase",
        },
      },
      BackupWalletSavePhrase: {
        on: {
          DONE: {
            target: "End",
          },
        },
      },
      AuthWithGoogle: {
        invoke: {
          src: "AuthWithGoogleMachine",
          id: "AuthWithGoogleMachine",
          input: ({ event }) => ({
            jwt: (event as Extract<Events, { type: "AUTH_WITH_GOOGLE" }>).data
              .jwt,
          }),
          onDone: [
            {
              guard: "isExistingAccount",
              actions: "assignAuthSession",
              target: "check2FA",
            },
            {
              actions: "assignAuthSession",
              target: "AuthSelection",
            },
          ],
        },
      },
      SignUpWithGoogle: {
        invoke: {
          src: "AuthWithGoogleMachine",
          id: "AuthWithGoogleMachine",
          input: ({ event }) => ({
            jwt: (event as Extract<Events, { type: "AUTH_WITH_GOOGLE" }>).data
              .jwt,
          }),
          onDone: [
            {
              guard: "isExistingAccount",
              actions: "assignAuthSession",
              target: "checkPasskeys",
            },
            {
              actions: "assignAuthSession",
              target: "AuthSelectionSignUp",
            },
          ],
        },
      },
      AuthWithII: {
        invoke: {
          id: "AuthWithIIService",
          src: "signWithIIService",
          onDone: [
            {
              guard: "isExistingAccount",
              actions: "assignAuthSession",
              target: "check2FA",
            },
            {
              actions: "assignAuthSession",
              target: "AuthSelection",
            },
          ],
        },
      },
      SignUpWithII: {
        invoke: {
          id: "AuthWithIIService",
          src: "signWithIIService",
          onDone: [
            {
              guard: "isExistingAccount",
              actions: "assignAuthSession",
              target: "checkPasskeys",
            },
            {
              actions: "assignAuthSession",
              target: "AuthSelectionSignUp",
            },
          ],
        },
      },
      SignUpWithEmail: {
        invoke: {
          src: "AuthWithEmailMachine",
          id: "AuthWithEmailMachine",
          input: ({
            context: snapshot,
          }: {
            context: AuthenticationContext
          }) => ({
            authRequest: snapshot.authRequest,
            appMeta: snapshot.appMeta,
            verificationEmail: snapshot.verificationEmail ?? "",
          }),
          onDone: [
            { guard: "isReturn", target: "AuthSelectionSignUp" },
            {
              actions: "assignAuthSession",
              target: "checkPasskeys",
            },
          ],
        },
      },
      EmailAuthentication: {
        invoke: {
          src: "AuthWithEmailMachine",
          id: "AuthWithEmailMachine",
          input: ({
            context: snapshot,
          }: {
            context: AuthenticationContext
          }) => ({
            authRequest: snapshot.authRequest,
            appMeta: snapshot.appMeta,
            verificationEmail: snapshot.verificationEmail ?? "",
          }),
          onDone: [
            { guard: "isReturn", target: "AuthSelection" },
            {
              actions: "assignAuthSession",
              target: "check2FA",
            },
          ],
        },
      },
      OtherSignOptions: {
        on: {
          BACK: "AuthSelection",
          AUTHENTICATED: {
            target: "End",
            actions: "assignAuthSession",
          },
          AUTH_WITH_RECOVERY_PHRASE: {
            target: "SignInWithRecoveryPhrase",
          },
        },
      },
      check2FA: {
        invoke: {
          src: "checkIf2FAEnabled",
          id: "checkIf2FAEnabled",
          input: ({ context: snapshot }: { context: AuthenticationContext }) =>
            snapshot,
          onDone: [
            {
              guard: "is2FAEnabled",
              target: "TwoFA",
              actions: "assignAllowedDevices",
            },
            {
              target: "checkPasskeys6th",
              actions: "setShouldCheckRecoveryEvery8th",
            },
          ],
          onError: {
            target: "End",
          },
        },
      },
      TwoFA: {
        on: {
          AUTHENTICATED: {
            target: "checkRecovery8th",
          },
        },
      },
      checkPasskeys6th: {
        invoke: {
          src: "shouldShowPasskeys6th",
          id: "shouldShowPasskeys6th",
          input: ({ context: snapshot }: { context: AuthenticationContext }) =>
            snapshot,
          onDone: [
            {
              actions: "assignShowPasskeys",
              guard: "showPasskeys",
              target: "AddPasskeys",
            },
            {
              guard: "shouldCheckRecovery8th",
              target: "checkRecovery8th",
            },
            { target: "End" },
          ],
          onError: {
            target: "End",
          },
        },
      },
      checkRecovery8th: {
        invoke: {
          src: "shouldShowRecovery8th",
          id: "shouldShowRecovery8th",
          input: ({ context: snapshot }: { context: AuthenticationContext }) =>
            snapshot,
          onDone: [
            {
              actions: "assignShowRecovery",
              guard: "showRecovery",
              target: "BackupWallet",
            },
            { target: "End" },
          ],
          onError: {
            target: "End",
          },
        },
      },
      checkPasskeys: {
        invoke: {
          src: "shouldShowPasskeys",
          id: "shouldShowPasskeys",
          input: ({ context: snapshot }: { context: AuthenticationContext }) =>
            snapshot,
          onDone: [
            {
              actions: "assignShowPasskeys",
              guard: "showPasskeys",
              target: "AddPasskeys",
            },
            { target: "End" },
          ],
          onError: {
            target: "End",
          },
        },
      },
      AddPasskeys: {
        on: {
          BACK: "AuthSelection",
          CONTINUE: {
            target: "AddPasskeysSuccess",
          },
          SKIP: {
            target: "End",
          },
        },
      },
      AddPasskeysSuccess: {
        on: {
          DONE: {
            target: "End",
          },
        },
      },
      End: {
        type: "final",
        output: ({
          context: snapshot,
        }: {
          context: AuthenticationContext
        }) => ({ ...snapshot }),
      },
    },
  },
  {
    guards: {
      isExistingAccount: ({ event }) =>
        !!doneOutput<AbstractAuthSession>(event)?.anchor,
      isReturn: ({ event }) => {
        const out = doneOutput(event)
        const isReturn = !out
        return isReturn
      },
      is2FAEnabled: ({ event }) => !!doneOutput(event),
      showPasskeys: ({ event }) => {
        const showPasskeys = doneOutput<{ showPasskeys?: boolean }>(
          event,
        )?.showPasskeys
        if (showPasskeys === undefined) return true
        return showPasskeys
      },
      showRecovery: ({ event }) => {
        const showRecovery = doneOutput<{ showRecovery?: boolean }>(
          event,
        )?.showRecovery
        if (showRecovery === undefined) return true
        return showRecovery
      },
      shouldCheckRecovery8th: ({
        context: snapshot,
      }: {
        context: AuthenticationContext
      }) => !!snapshot.shouldShowRecoveryEvery8th,
    },
    actions: {
      setShouldCheckRecoveryEvery8th: assign(() => {
        return {
          shouldShowRecoveryEvery8th: true,
        }
      }),
      assignAuthSession: assign(({ event }) => {
        const out = doneOutput<AbstractAuthSession>(event)
        const data = (event as { data?: AbstractAuthSession }).data
        return {
          authSession: out ?? data,
        }
      }),
      assignVerificationEmail: assign(({ event }) => ({
        verificationEmail: (
          event as Extract<Events, { type: "AUTH_WITH_EMAIL" }>
        ).data.email,
      })),
      assignAllowedDevices: assign(({ event }) => ({
        allowedDevices: doneOutput<{ allowedPasskeys?: string[] }>(event)
          ?.allowedPasskeys,
      })),
      assignEmail: assign(({ event }) => ({
        email: (event as Extract<Events, { type: "AUTH_WITH_GOOGLE" }>).data
          ?.email,
      })),
      assignShowPasskeys: assign(({ event }) => ({
        showPasskeys: doneOutput<{ showPasskeys?: boolean }>(event)
          ?.showPasskeys,
      })),
      assignShowRecovery: assign(({ event }) => ({
        showRecovery: doneOutput<{ showRecovery?: boolean }>(event)
          ?.showRecovery,
      })),
      assignIsEmbed: assign(({ event }) => ({
        isEmbed: (event as { data?: { isEmbed?: boolean } }).data?.isEmbed,
      })),
    },
    actors: {
      AuthWithEmailMachine,
      AuthWithGoogleMachine,
      checkIf2FAEnabled: fromPromise(({ input }) =>
        checkIf2FAEnabled(input as AuthenticationContext),
      ),
      shouldShowPasskeys: fromPromise(({ input }) =>
        shouldShowPasskeys(input as AuthenticationContext),
      ),
      shouldShowPasskeys6th: fromPromise(({ input }) =>
        shouldShowPasskeysEvery6thTime(input as AuthenticationContext),
      ),
      shouldShowRecovery8th: fromPromise(() =>
        shouldShowRecoveryPhraseEvery8thTime(),
      ),
      signWithIIService: fromPromise(() => signWithIIService()),
    },
  },
)

export type AuthenticationMachineActor = ActorRefFrom<
  typeof AuthenticationMachine
>
export type AuthenticationMachineType = typeof AuthenticationMachine
export default AuthenticationMachine
