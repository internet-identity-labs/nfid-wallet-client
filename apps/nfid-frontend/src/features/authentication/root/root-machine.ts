import { ActorRefFrom, assign, createMachine, fromPromise } from "xstate"

// Orchestrates top-level authentication flows (email, Google, II, other)
// and post-auth onboarding steps (2FA, passkeys, recovery prompts).
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

const authenticationMachineConfig = {
  id: "auth-machine",
  context: ({ input }: { input: any }) => input as AuthenticationContext,
  initial: "AuthSelection",
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
          actions: ["assignAuthSession"],
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
          actions: ["assignAuthSession"],
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
        input: ({
          event,
        }: {
          event: Extract<Events, { type: "AUTH_WITH_GOOGLE" }>
        }) => {
          return { jwt: event.data.jwt }
        },
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
        input: ({
          event,
        }: {
          event: Extract<Events, { type: "AUTH_WITH_GOOGLE" }>
        }) => {
          return { jwt: event.data.jwt }
        },
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
        input: ({ context }: { context: AuthenticationContext }) => ({
          authRequest: context?.authRequest,
          appMeta: context?.appMeta,
          verificationEmail: context?.verificationEmail,
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
        input: ({ context }: { context: AuthenticationContext }) => ({
          authRequest: context?.authRequest,
          appMeta: context?.appMeta,
          verificationEmail: context?.verificationEmail,
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
        input: ({ context }: { context: AuthenticationContext }) => context,
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
        src: "shouldShowPasskeysEvery6thTime",
        id: "shouldShowPasskeys6th",
        input: ({ context }: { context: AuthenticationContext }) => context,
        onDone: [
          {
            actions: "assignShowPasskeys",
            guard: "showPasskeys",
            target: "AddPasskeys",
          },
          {
            guard: ({ context }: { context: AuthenticationContext }) =>
              !!context.shouldShowRecoveryEvery8th,
            target: "checkRecovery8th",
          },
          { target: "End" },
        ],
      },
    },
    checkRecovery8th: {
      invoke: {
        src: "shouldShowRecoveryPhraseEvery8thTime",
        id: "shouldShowRecovery8th",
        onDone: [
          {
            actions: "assignShowRecovery",
            guard: "showRecovery",
            target: "BackupWallet",
          },
          { target: "End" },
        ],
      },
    },
    checkPasskeys: {
      invoke: {
        src: "shouldShowPasskeys",
        id: "shouldShowPasskeys",
        input: ({ context }: { context: AuthenticationContext }) => context,
        onDone: [
          {
            actions: "assignShowPasskeys",
            guard: "showPasskeys",
            target: "AddPasskeys",
          },
          { target: "End" },
        ],
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
      type: "final" as const,
      output: ({ context }: { context: AuthenticationContext }) => ({
        ...context,
      }),
    },
  },
}

const authenticationMachineOptions = {
  guards: {
    isExistingAccount: ({ event }: { event: any }) => !!event?.output?.anchor,
    isReturn: ({ event }: { event: any }) => {
      return !event.output
    },
    is2FAEnabled: ({ event }: { event: any }) => {
      return !!event.output
    },
    showPasskeys: ({ event }: { event: any }) => {
      const showPasskeys = event.output?.showPasskeys
      if (showPasskeys === undefined) return true
      return showPasskeys
    },
    showRecovery: ({ event }: { event: any }) => {
      const showRecovery = event.output?.showRecovery
      if (showRecovery === undefined) return true
      return showRecovery
    },
  },
  actions: {
    setShouldCheckRecoveryEvery8th: assign(() => {
      return {
        shouldShowRecoveryEvery8th: true,
      }
    }),
    assignAuthSession: assign(({ event }: { event: any }) => {
      return {
        authSession: event.output ?? event.data,
      }
    }),
    assignVerificationEmail: assign(({ event }: { event: any }) => ({
      verificationEmail: event.data.email,
    })),
    assignAllowedDevices: assign(({ event }: { event: any }) => ({
      allowedDevices: event.output?.allowedPasskeys,
    })),
    assignEmail: assign(({ event }: { event: any }) => ({
      email: event.data?.email,
    })),
    assignShowPasskeys: assign(({ event }: { event: any }) => ({
      showPasskeys: event.output?.showPasskeys,
    })),
    assignShowRecovery: assign(({ event }: { event: any }) => ({
      showRecovery: event.output?.showRecovery,
    })),
    assignIsEmbed: assign(({ event }: { event: any }) => ({
      isEmbed: event.data?.isEmbed,
    })),
  },
  actors: {
    AuthWithEmailMachine,
    AuthWithGoogleMachine,
    signWithIIService: fromPromise(() => signWithIIService()),
    checkIf2FAEnabled: fromPromise(
      ({ input }: { input: AuthenticationContext }) => checkIf2FAEnabled(input),
    ),
    shouldShowPasskeysEvery6thTime: fromPromise(
      ({ input }: { input: AuthenticationContext }) =>
        shouldShowPasskeysEvery6thTime(input),
    ),
    shouldShowRecoveryPhraseEvery8thTime: fromPromise(() =>
      shouldShowRecoveryPhraseEvery8thTime(),
    ),
    shouldShowPasskeys: fromPromise(
      ({ input }: { input: AuthenticationContext }) =>
        shouldShowPasskeys(input),
    ),
  },
}

const AuthenticationMachine = createMachine(
  authenticationMachineConfig,
  authenticationMachineOptions,
)

export type AuthenticationMachineActor = ActorRefFrom<
  typeof AuthenticationMachine
>
export type AuthenticationMachineType = typeof AuthenticationMachine
export default AuthenticationMachine
