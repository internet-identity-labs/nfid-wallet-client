import { ActorRefFrom, assign, createMachine } from "xstate"

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
  | { type: "done.invoke.AuthWithGoogleMachine"; data: AbstractAuthSession }
  | { type: "done.invoke.AuthWithEmailMachine"; data: AbstractAuthSession }
  | { type: "done.invoke.AuthWithIIService"; data: AbstractAuthSession }
  | {
      type: "done.invoke.checkIf2FAEnabled"
      data?: { allowedPasskeys: string[]; email?: string }
    }
  | {
      type: "done.invoke.shouldShowPasskeys"
      data?: { showPasskeys: boolean }
    }
  | {
      type: "done.invoke.shouldShowPasskeys6th"
      data?: { showPasskeys: boolean }
    }
  | {
      type: "done.invoke.shouldShowRecovery8th"
      data?: { showRecovery: boolean }
    }
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

export interface Schema {
  events: Events
  context: AuthenticationContext
}

const authenticationMachineConfig = {
  predictableActionArguments: true,
  tsTypes: {} as import("./root-machine.typegen").Typegen0,
  schema: { events: {}, context: {} } as Schema,
  id: "auth-machine",
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
        data: (
          _: AuthenticationContext,
          event: Extract<Events, { type: "AUTH_WITH_GOOGLE" }>,
        ) => {
          return { jwt: event.data.jwt }
        },
        onDone: [
          {
            cond: "isExistingAccount",
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
        data: (
          _: AuthenticationContext,
          event: Extract<Events, { type: "AUTH_WITH_GOOGLE" }>,
        ) => {
          return { jwt: event.data.jwt }
        },
        onDone: [
          {
            cond: "isExistingAccount",
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
        src: () => signWithIIService(),
        onDone: [
          {
            cond: "isExistingAccount",
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
        src: () => signWithIIService(),
        onDone: [
          {
            cond: "isExistingAccount",
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
        data: (context: AuthenticationContext) => ({
          authRequest: context?.authRequest,
          appMeta: context?.appMeta,
          verificationEmail: context?.verificationEmail,
        }),
        onDone: [
          { cond: "isReturn", target: "AuthSelectionSignUp" },
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
        data: (context: AuthenticationContext) => ({
          authRequest: context?.authRequest,
          appMeta: context?.appMeta,
          verificationEmail: context?.verificationEmail,
        }),
        onDone: [
          { cond: "isReturn", target: "AuthSelection" },
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
        onDone: [
          {
            cond: "is2FAEnabled",
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
        src: (context: AuthenticationContext) =>
          shouldShowPasskeysEvery6thTime(context),
        id: "shouldShowPasskeys6th",
        onDone: [
          {
            actions: "assignShowPasskeys",
            cond: "showPasskeys",
            target: "AddPasskeys",
          },
          {
            cond: (context: AuthenticationContext) =>
              !!context.shouldShowRecoveryEvery8th,
            target: "checkRecovery8th",
          },
          { target: "End" },
        ],
      },
    },
    checkRecovery8th: {
      invoke: {
        src: () => shouldShowRecoveryPhraseEvery8thTime(),
        id: "shouldShowRecovery8th",
        onDone: [
          {
            actions: "assignShowRecovery",
            cond: "showRecovery",
            target: "BackupWallet",
          },
          { target: "End" },
        ],
      },
    },
    checkPasskeys: {
      invoke: {
        src: (context: AuthenticationContext) => shouldShowPasskeys(context),
        id: "shouldShowPasskeys",
        onDone: [
          {
            actions: "assignShowPasskeys",
            cond: "showPasskeys",
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
      data: (context: AuthenticationContext) => ({ ...context }),
    },
  },
}

const authenticationMachineOptions: Parameters<
  typeof createMachine<AuthenticationContext, Events, any>
>[1] = {
  guards: {
    isExistingAccount: (_: AuthenticationContext, event: any) =>
      !!event?.data?.anchor,
    isReturn: (_: AuthenticationContext, event: any) => {
      return !event.data
    },
    is2FAEnabled: (_: AuthenticationContext, event: any) => {
      return !!event.data
    },
    showPasskeys: (_: AuthenticationContext, event: any) => {
      const showPasskeys = event.data?.showPasskeys
      if (showPasskeys === undefined) return true
      return showPasskeys
    },
    showRecovery: (_: AuthenticationContext, event: any) => {
      const showRecovery = event.data?.showRecovery
      if (showRecovery === undefined) return true
      return showRecovery
    },
  },
  actions: {
    setShouldCheckRecoveryEvery8th: assign<AuthenticationContext, Events, any>(
      () => {
        return {
          shouldShowRecoveryEvery8th: true,
        }
      },
    ),
    assignAuthSession: assign<AuthenticationContext, Events, any>(
      (_: AuthenticationContext, event: any) => {
        return {
          authSession: event.data,
        }
      },
    ),
    assignVerificationEmail: assign<AuthenticationContext, Events, any>(
      (_: AuthenticationContext, event: any) => ({
        verificationEmail: event.data.email,
      }),
    ),
    assignAllowedDevices: assign<AuthenticationContext, Events, any>(
      (_: AuthenticationContext, event: any) => ({
        allowedDevices: event.data?.allowedPasskeys,
      }),
    ),
    assignEmail: assign<AuthenticationContext, Events, any>(
      (_: AuthenticationContext, event: any) => ({
        email: event.data?.email,
      }),
    ),
    assignShowPasskeys: assign<AuthenticationContext, Events, any>(
      (_: AuthenticationContext, event: any) => ({
        showPasskeys: event.data?.showPasskeys,
      }),
    ),
    assignShowRecovery: assign<AuthenticationContext, Events, any>(
      (_: AuthenticationContext, event: any) => ({
        showRecovery: event.data?.showRecovery,
      }),
    ),
    assignIsEmbed: assign<AuthenticationContext, Events, any>(
      (_: AuthenticationContext, event: any) => ({
        isEmbed: event.data?.isEmbed,
      }),
    ),
  },
  services: {
    AuthWithEmailMachine,
    AuthWithGoogleMachine,
    checkIf2FAEnabled,
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
