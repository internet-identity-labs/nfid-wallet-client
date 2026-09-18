import { setup, fromPromise, assign, ActorRefFrom } from "xstate"
import toaster from "packages/ui/src/atoms/toast"

import {
  ExistingWallet,
  getAllWalletsFromThisDevice,
  RegistrationDisabledError,
} from "@nfid/integration"

import { isWebAuthNSupported } from "frontend/integration/device"
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
import AuthWithEmailMachine from "../auth-selection/email-flow/machine"
import { signWithGoogleService } from "../auth-selection/google-flow/services"

export interface AuthenticationContext {
  verificationEmail?: string
  authRequest?: Partial<AuthorizationRequest>
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
  wallets?: ExistingWallet[]
}

const AuthenticationMachine = setup({
  types: {} as {
    context: AuthenticationContext
    input: Partial<AuthenticationContext>
    output: { authSession: AbstractAuthSession | undefined }
  },
  actors: {
    getAllWalletsFromThisDevice: fromPromise(async () =>
      getAllWalletsFromThisDevice(),
    ),
    AuthWithEmailMachine,
    signWithGoogleService: fromPromise(
      async ({
        input,
      }: {
        input: { jwt: string }
      }): Promise<AbstractAuthSession> =>
        signWithGoogleService({ jwt: input.jwt }),
    ),
    signWithIIService: fromPromise(async () => signWithIIService()),
    checkIf2FAEnabled: fromPromise(
      async ({ input }: { input: AuthenticationContext }) =>
        checkIf2FAEnabled(input),
    ),
    shouldShowPasskeysEvery6thTime: fromPromise(
      async ({ input }: { input: AuthenticationContext }) =>
        shouldShowPasskeysEvery6thTime(input),
    ),
    shouldShowRecoveryPhraseEvery8thTime: fromPromise(async () =>
      shouldShowRecoveryPhraseEvery8thTime(),
    ),
    shouldShowPasskeys: fromPromise(
      async ({ input }: { input: AuthenticationContext }) =>
        shouldShowPasskeys(input),
    ),
  },
  guards: {
    hasWalletsAndPasskeySupported: ({ event }: { event: any }) =>
      (event.output as ExistingWallet[]).length > 0 && isWebAuthNSupported(),
    isExistingAccount: ({ event }: { event: any }) =>
      !!(event.output as AbstractAuthSession)?.anchor,
    isReturn: ({ context }: { context: AuthenticationContext }) =>
      !context.authSession,
    is2FAEnabled: ({ event }: { event: any }) => !!event.output,
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
    shouldShowRecoveryEvery8th: ({
      context,
    }: {
      context: AuthenticationContext
    }) => !!context.shouldShowRecoveryEvery8th,
  },
  actions: {
    assignWallets: assign({
      wallets: ({ event }: { event: any }) => event.output as ExistingWallet[],
    }),
    assignAuthSession: assign({
      authSession: ({ event }: { event: any }) =>
        (event.output ?? event.data) as AbstractAuthSession,
    }),
    assignVerificationEmail: assign({
      verificationEmail: ({ event }: { event: any }) => event.data?.email,
    }),
    assignIsEmbed: assign({
      isEmbed: ({ event }: { event: any }) => event.data?.isEmbed,
    }),
    assignEmail: assign({
      email: ({ event }: { event: any }) => event.data?.email,
    }),
    assignAllowedDevices: assign({
      allowedDevices: ({ event }: { event: any }) =>
        event.output?.allowedPasskeys,
    }),
    assignShowPasskeys: assign({
      showPasskeys: ({ event }: { event: any }) => event.output?.showPasskeys,
    }),
    assignShowRecovery: assign({
      showRecovery: ({ event }: { event: any }) => event.output?.showRecovery,
    }),
    setShouldCheckRecoveryEvery8th: assign({
      shouldShowRecoveryEvery8th: () => true,
    }),
    toastRegistrationDisabled: ({ event }: { event: any }) => {
      if (event.error instanceof RegistrationDisabledError) {
        toaster.info(
          "Creating new accounts via email or Google is no longer supported as NFID transitions to full decentralization. Please use a passkey or web3 sign-in method instead.",
          undefined,
          "Email Signup Deprecated",
        )
      }
    },
  },
}).createMachine({
  id: "auth-machine",
  context: ({ input }) => ({
    wallets: [],
    ...input,
  }),
  output: ({ context }: { context: AuthenticationContext }) => ({
    authSession: context.authSession,
  }),
  initial: "CheckWallets",
  states: {
    CheckWallets: {
      invoke: {
        src: "getAllWalletsFromThisDevice",
        onDone: [
          {
            guard: "hasWalletsAndPasskeySupported",
            actions: "assignWallets",
            target: "ChooseWallet",
          },
          { target: "AuthSelection" },
        ],
      },
    },
    ChooseWallet: {
      on: {
        AUTH_WITH_PASSKEY: {
          actions: "assignAuthSession",
          target: "checkRecovery8th",
        },
        CHOOSE_WALLET: {
          target: "AuthSelection",
        },
        BACK: {
          target: "AuthSelection",
        },
      },
    },
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
        AUTH_WITH_PASSKEY: {
          actions: "assignAuthSession",
          target: "checkRecovery8th",
        },
        CHOOSE_WALLET: {
          target: "ChooseWallet",
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
    AuthAddRecoveryPhrase: {
      on: {
        SKIP: {
          target: "End",
        },
        DONE: "AuthSaveRecoveryPhrase",
      },
    },
    AuthSaveRecoveryPhrase: {
      on: {
        DONE: {
          target: "End",
        },
      },
    },
    AuthWithGoogle: {
      invoke: {
        src: "signWithGoogleService",
        id: "signWithGoogleService",
        input: ({ event }: { event: any }) => ({ jwt: event.data.jwt }),
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
        onError: {
          target: "AuthSelection",
          actions: "toastRegistrationDisabled",
        },
      },
    },
    SignUpWithGoogle: {
      invoke: {
        src: "signWithGoogleService",
        id: "signWithGoogleService",
        input: ({ event }: { event: any }) => ({ jwt: event.data.jwt }),
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
        onError: {
          target: "AuthSelectionSignUp",
          actions: "toastRegistrationDisabled",
        },
      },
    },
    AuthWithII: {
      invoke: {
        src: "signWithIIService",
        id: "AuthWithIIService",
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
        src: "signWithIIService",
        id: "AuthWithIIService",
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
      entry: assign({ authSession: () => undefined }),
      invoke: {
        src: "AuthWithEmailMachine",
        id: "AuthWithEmailMachine",
        input: ({ context }: { context: AuthenticationContext }) => ({
          verificationEmail: context.verificationEmail ?? "",
          authRequest: context.authRequest,
          appMeta: context.appMeta,
        }),
        onDone: [
          { guard: "isReturn", target: "AuthSelectionSignUp" },
          { target: "checkPasskeys" },
        ],
      },
      on: {
        EMAIL_AUTH_COMPLETE: { actions: "assignAuthSession" },
      },
    },
    EmailAuthentication: {
      entry: assign({ authSession: () => undefined }),
      invoke: {
        src: "AuthWithEmailMachine",
        id: "AuthWithEmailMachine",
        input: ({ context }: { context: AuthenticationContext }) => ({
          verificationEmail: context.verificationEmail ?? "",
          authRequest: context.authRequest,
          appMeta: context.appMeta,
        }),
        onDone: [
          { guard: "isReturn", target: "AuthSelection" },
          { target: "check2FA" },
        ],
      },
      on: {
        EMAIL_AUTH_COMPLETE: { actions: "assignAuthSession" },
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
        input: ({ context }) => context,
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
        input: ({ context }) => context,
        onDone: [
          {
            actions: "assignShowPasskeys",
            guard: "showPasskeys",
            target: "AddPasskeys",
          },
          {
            guard: "shouldShowRecoveryEvery8th",
            target: "checkRecovery8th",
          },
          { target: "End" },
        ],
      },
    },
    checkRecovery8th: {
      invoke: {
        src: "shouldShowRecoveryPhraseEvery8thTime",
        onDone: [
          {
            actions: "assignShowRecovery",
            guard: "showRecovery",
            target: "AuthAddRecoveryPhrase",
          },
          { target: "End" },
        ],
      },
    },
    checkPasskeys: {
      invoke: {
        src: "shouldShowPasskeys",
        input: ({ context }) => context,
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
    },
  },
})

export type AuthenticationMachineActor = ActorRefFrom<
  typeof AuthenticationMachine
>
export type AuthenticationMachineType = typeof AuthenticationMachine
export default AuthenticationMachine
