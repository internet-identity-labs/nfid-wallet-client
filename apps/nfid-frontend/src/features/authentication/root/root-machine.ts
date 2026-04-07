import { ActorRefFrom, assign, fromPromise, setup } from "xstate"
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
  | { type: "done.invoke.AuthWithGoogleMachine"; output: AbstractAuthSession }
  | { type: "done.invoke.AuthWithEmailMachine"; output: AbstractAuthSession }
  | { type: "done.invoke.AuthWithIIService"; output: AbstractAuthSession }
  | {
      type: "done.invoke.checkIf2FAEnabled"
      output?: { allowedPasskeys: string[]; email?: string }
    }
  | {
      type: "done.invoke.shouldShowPasskeys"
      output?: { showPasskeys: boolean }
    }
  | {
      type: "done.invoke.shouldShowPasskeys6th"
      output?: { showPasskeys: boolean }
    }
  | {
      type: "done.invoke.shouldShowRecovery8th"
      output?: { showRecovery: boolean }
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

type AuthenticationMachineTypes = {
  context: AuthenticationContext
  events: Events
  input: Partial<AuthenticationContext>
  output: AuthenticationContext
}

const act = <T extends string>(type: T) => ({ type }) as const
const grd = <T extends string>(type: T) => ({ type }) as const

const authenticationMachineConfig = {
  id: "auth-machine",
  initial: "AuthSelection",
  output: ({ context }: { context: AuthenticationContext }) => ({
    ...context,
  }),
  context: ({ input }: { input?: Partial<AuthenticationContext> }) =>
    ({ ...(input ?? {}) }) as AuthenticationContext,
  states: {
    AuthSelection: {
      on: {
        AUTH_WITH_EMAIL: {
          target: "EmailAuthentication",
          actions: [act("assignVerificationEmail"), act("assignIsEmbed")],
        },
        AUTH_WITH_GOOGLE: {
          target: "AuthWithGoogle",
          actions: [act("assignEmail"), act("assignIsEmbed")],
        },
        AUTH_WITH_II: {
          target: "AuthWithII",
          actions: [act("assignAuthSession")],
        },
        AUTH_WITH_OTHER: {
          target: "OtherSignOptions",
          actions: act("assignIsEmbed"),
        },
        AUTHENTICATED: {
          actions: act("assignAuthSession"),
          target: "End",
        },
        SIGN_UP: {
          target: "AuthSelectionSignUp",
        },
        SIGN_IN_PASSKEY: {
          actions: act("assignAuthSession"),
          target: "checkRecovery8th",
        },
      },
    },
    AuthSelectionSignUp: {
      on: {
        AUTH_WITH_EMAIL: {
          target: "SignUpWithEmail",
          actions: [act("assignVerificationEmail"), act("assignIsEmbed")],
        },
        AUTH_WITH_GOOGLE: {
          target: "SignUpWithGoogle",
          actions: [act("assignEmail"), act("assignIsEmbed")],
        },
        AUTH_WITH_II: {
          target: "SignUpWithII",
          actions: [act("assignAuthSession")],
        },
        AUTHENTICATED: {
          actions: act("assignAuthSession"),
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
          actions: act("assignAuthSession"),
        },
      },
    },
    SignInWithRecoveryPhrase: {
      on: {
        BACK: "OtherSignOptions",
        AUTHENTICATED: {
          target: "checkPasskeys6th",
          actions: act("assignAuthSession"),
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
        src: "AuthWithGoogleMachine" as const,
        id: "AuthWithGoogleMachine",
        input: ({ event }: { event: Events }) => {
          if (event.type !== "AUTH_WITH_GOOGLE") return { jwt: "" }
          return { jwt: event.data.jwt }
        },
        onDone: [
          {
            guard: grd("isExistingAccount"),
            actions: act("assignAuthSession"),
            target: "check2FA",
          },
          {
            actions: act("assignAuthSession"),
            target: "AuthSelection",
          },
        ],
      },
    },
    SignUpWithGoogle: {
      invoke: {
        src: "AuthWithGoogleMachine" as const,
        id: "AuthWithGoogleMachine",
        input: ({ event }: { event: Events }) => {
          if (event.type !== "AUTH_WITH_GOOGLE") return { jwt: "" }
          return { jwt: event.data.jwt }
        },
        onDone: [
          {
            guard: grd("isExistingAccount"),
            actions: act("assignAuthSession"),
            target: "checkPasskeys",
          },
          {
            actions: act("assignAuthSession"),
            target: "AuthSelectionSignUp",
          },
        ],
      },
    },
    AuthWithII: {
      invoke: {
        id: "AuthWithIIService",
        src: "AuthWithIIService" as const,
        onDone: [
          {
            guard: grd("isExistingAccount"),
            actions: act("assignAuthSession"),
            target: "check2FA",
          },
          {
            actions: act("assignAuthSession"),
            target: "AuthSelection",
          },
        ],
      },
    },
    SignUpWithII: {
      invoke: {
        id: "AuthWithIIService",
        src: "AuthWithIIService" as const,
        onDone: [
          {
            guard: grd("isExistingAccount"),
            actions: act("assignAuthSession"),
            target: "checkPasskeys",
          },
          {
            actions: act("assignAuthSession"),
            target: "AuthSelectionSignUp",
          },
        ],
      },
    },
    SignUpWithEmail: {
      invoke: {
        src: "AuthWithEmailMachine" as const,
        id: "AuthWithEmailMachine",
        input: ({ context }: { context: AuthenticationContext }) => ({
          authRequest: context?.authRequest,
          appMeta: context?.appMeta,
          verificationEmail: context?.verificationEmail,
        }),
        onDone: [
          {
            actions: act("debugInvokeDone"),
            guard: grd("isReturn"),
            target: "AuthSelectionSignUp",
          },
          {
            actions: [act("debugInvokeDone"), act("assignAuthSession")],
            target: "checkPasskeys",
          },
        ],
      },
    },
    EmailAuthentication: {
      invoke: {
        src: "AuthWithEmailMachine" as const,
        id: "AuthWithEmailMachine",
        input: ({ context }: { context: AuthenticationContext }) => ({
          authRequest: context?.authRequest,
          appMeta: context?.appMeta,
          verificationEmail: context?.verificationEmail,
        }),
        onDone: [
          {
            actions: act("debugInvokeDone"),
            guard: grd("isReturn"),
            target: "AuthSelection",
          },
          {
            actions: [act("debugInvokeDone"), act("assignAuthSession")],
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
          actions: act("assignAuthSession"),
        },
        AUTH_WITH_RECOVERY_PHRASE: {
          target: "SignInWithRecoveryPhrase",
        },
      },
    },
    check2FA: {
      invoke: {
        src: "checkIf2FAEnabled" as const,
        id: "checkIf2FAEnabled",
        input: ({ context }: { context: AuthenticationContext }) => context,
        onDone: [
          {
            guard: grd("is2FAEnabled"),
            target: "TwoFA",
            actions: act("assignAllowedDevices"),
          },
          {
            target: "checkPasskeys6th",
            actions: act("setShouldCheckRecoveryEvery8th"),
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
        src: "shouldShowPasskeys6th" as const,
        id: "shouldShowPasskeys6th",
        input: ({ context }: { context: AuthenticationContext }) => context,
        onDone: [
          {
            actions: act("assignShowPasskeys"),
            guard: grd("showPasskeys"),
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
        src: "shouldShowRecovery8th" as const,
        id: "shouldShowRecovery8th",
        onDone: [
          {
            actions: act("assignShowRecovery"),
            guard: grd("showRecovery"),
            target: "BackupWallet",
          },
          { target: "End" },
        ],
      },
    },
    checkPasskeys: {
      invoke: {
        src: "shouldShowPasskeys" as const,
        id: "shouldShowPasskeys",
        input: ({ context }: { context: AuthenticationContext }) => context,
        onDone: [
          {
            actions: act("assignShowPasskeys"),
            guard: grd("showPasskeys"),
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
    isExistingAccount: ({ event }: any) => {
      const payload = event?.output ?? event?.data
      const result = !!payload?.anchor
      return result
    },
    isReturn: ({ event }: any) => {
      const payload = event?.output ?? event?.data
      const result = !payload
      return result
    },
    is2FAEnabled: ({ event }: any) => {
      return !!(event?.output ?? event?.data)
    },
    showPasskeys: ({ event }: any) => {
      const showPasskeys = event?.output?.showPasskeys
      if (showPasskeys === undefined) return true
      return showPasskeys
    },
    showRecovery: ({ event }: any) => {
      const showRecovery = event?.output?.showRecovery
      if (showRecovery === undefined) return true
      return showRecovery
    },
  },
  actions: {
    debugInvokeDone: ({ event }: any) => {},
    setShouldCheckRecoveryEvery8th: assign<
      AuthenticationContext,
      Events,
      undefined,
      Events,
      any
    >(() => ({
      shouldShowRecoveryEvery8th: true,
    })),
    assignAuthSession: assign<
      AuthenticationContext,
      Events,
      undefined,
      Events,
      any
    >(
      ({
        context,
        event,
      }: {
        context: AuthenticationContext
        event: Events
      }) => {
        const payload = event as unknown as { output?: unknown; data?: unknown }
        const authSession = (payload.output ??
          payload.data) as AbstractAuthSession

        return { authSession }
      },
    ),
    assignVerificationEmail: assign<
      AuthenticationContext,
      Events,
      undefined,
      Events,
      any
    >(({ event }: { event: Events }) => {
      if (event.type !== "AUTH_WITH_EMAIL") return {}
      return { verificationEmail: event.data.email }
    }),
    assignAllowedDevices: assign<
      AuthenticationContext,
      Events,
      undefined,
      Events,
      any
    >(({ event }: { event: Events }) => {
      if (event.type !== "done.invoke.checkIf2FAEnabled") return {}
      return {
        allowedDevices: event.output?.allowedPasskeys,
        email2FA: event.output?.email,
      }
    }),
    assignEmail: assign<AuthenticationContext, Events, undefined, Events, any>(
      ({ event }: { event: Events }) => {
        if (event.type !== "AUTH_WITH_GOOGLE") return {}
        return { email: event.data?.email }
      },
    ),
    assignShowPasskeys: assign<
      AuthenticationContext,
      Events,
      undefined,
      Events,
      any
    >(({ event }: { event: Events }) => {
      if (
        event.type !== "done.invoke.shouldShowPasskeys" &&
        event.type !== "done.invoke.shouldShowPasskeys6th"
      )
        return {}
      return { showPasskeys: event.output?.showPasskeys }
    }),
    assignShowRecovery: assign<
      AuthenticationContext,
      Events,
      undefined,
      Events,
      any
    >(({ event }: { event: Events }) => {
      if (event.type !== "done.invoke.shouldShowRecovery8th") return {}
      return { showRecovery: event.output?.showRecovery }
    }),
    assignIsEmbed: assign<
      AuthenticationContext,
      Events,
      undefined,
      Events,
      any
    >(({ event }: { event: Events }) => {
      if (
        event.type !== "AUTH_WITH_EMAIL" &&
        event.type !== "AUTH_WITH_GOOGLE" &&
        event.type !== "AUTH_WITH_OTHER"
      )
        return {}
      return { isEmbed: event.data?.isEmbed }
    }),
  },
  actors: {
    AuthWithEmailMachine,
    AuthWithGoogleMachine,
    AuthWithIIService: fromPromise(async () => signWithIIService()),
    checkIf2FAEnabled: fromPromise(
      async ({ input }: { input: AuthenticationContext }) =>
        checkIf2FAEnabled(input),
    ),
    shouldShowPasskeys: fromPromise(
      async ({ input }: { input: AuthenticationContext }) =>
        shouldShowPasskeys(input),
    ),
    shouldShowPasskeys6th: fromPromise(
      async ({ input }: { input: AuthenticationContext }) =>
        shouldShowPasskeysEvery6thTime(input),
    ),
    shouldShowRecovery8th: fromPromise(async () =>
      shouldShowRecoveryPhraseEvery8thTime(),
    ),
  },
}

const AuthenticationMachine = setup({
  types: {} as AuthenticationMachineTypes,
  ...authenticationMachineOptions,
}).createMachine(authenticationMachineConfig)

export type AuthenticationMachineActor = ActorRefFrom<
  typeof AuthenticationMachine
>
export type AuthenticationMachineType = typeof AuthenticationMachine
export default AuthenticationMachine
