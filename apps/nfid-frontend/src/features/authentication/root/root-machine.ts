import { setup, fromPromise, assign, ActorRefFrom } from "xstate"
import toaster from "packages/ui/src/atoms/toast"

import {
  ExistingWallet,
  RecoveryProvisioningMode,
  RecoveryProvisioningPlan,
  RegistrationDisabledError,
  getAllWalletsFromThisDevice,
  recoveryProvisioningService,
} from "@nfid/integration"

import { isWebAuthNSupported } from "frontend/integration/device"
import { AbstractAuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { ApproveIcGetDelegationSdkResponse } from "../3rd-party/choose-account/types"
import { checkIf2FAEnabled } from "../services"
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
  isEmbed?: boolean
  wallets?: ExistingWallet[]
  recoveryProvisioningPlan?: RecoveryProvisioningPlan
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
    getRecoveryProvisioningPlan: fromPromise(async () =>
      recoveryProvisioningService.getPlan(),
    ),
    verifyRecoveryProvisioning: fromPromise(
      async ({ input }: { input: { plan: RecoveryProvisioningPlan } }) =>
        recoveryProvisioningService.checkAccount(input.plan),
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
    needsPasskey: ({ event }: { event: any }) =>
      event.output?.steps[0] === RecoveryProvisioningMode.PASSKEY,
    needsRecoveryPhrase: ({ event }: { event: any }) => {
      return event.output?.steps[0] === RecoveryProvisioningMode.RECOVERY_PHRASE
    },
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
    assignRecoveryProvisioningPlan: assign({
      recoveryProvisioningPlan: ({ event }: { event: any }) =>
        event.output as RecoveryProvisioningPlan,
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
          target: "GetRecoveryProvisioningPlan",
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
          target: "GetRecoveryProvisioningPlan",
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
          target: "GetRecoveryProvisioningPlan",
          actions: "assignAuthSession",
        },
      },
    },
    AuthAddRecoveryPhrase: {
      on: {
        DONE: "AuthSaveRecoveryPhrase",
      },
    },
    AuthSaveRecoveryPhrase: {
      on: {
        DONE: {
          target: "VerifyRecoveryProvisioning",
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
            target: "GetRecoveryProvisioningPlan",
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
            target: "GetRecoveryProvisioningPlan",
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
          { target: "GetRecoveryProvisioningPlan" },
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
          { target: "GetRecoveryProvisioningPlan" },
        ],
      },
    },
    TwoFA: {
      on: {
        AUTHENTICATED: {
          target: "GetRecoveryProvisioningPlan",
        },
      },
    },
    GetRecoveryProvisioningPlan: {
      invoke: {
        src: "getRecoveryProvisioningPlan",
        onDone: [
          {
            guard: "needsRecoveryPhrase",
            actions: "assignRecoveryProvisioningPlan",
            target: "AuthAddRecoveryPhrase",
          },
          {
            guard: "needsPasskey",
            actions: "assignRecoveryProvisioningPlan",
            target: "AddPasskeys",
          },
          { target: "End" },
        ],
        onError: { target: "End" },
      },
    },
    VerifyPasskeyProvisioning: {
      invoke: {
        src: "verifyRecoveryProvisioning",
        input: ({ context }: { context: AuthenticationContext }) => ({
          plan: context.recoveryProvisioningPlan!,
        }),
        onDone: { target: "AddPasskeysSuccess" },
        onError: { target: "End" },
      },
    },
    VerifyRecoveryProvisioning: {
      invoke: {
        src: "verifyRecoveryProvisioning",
        input: ({ context }: { context: AuthenticationContext }) => ({
          plan: context.recoveryProvisioningPlan!,
        }),
        onDone: { target: "End" },
        onError: { target: "End" },
      },
    },
    AddPasskeys: {
      on: {
        CONTINUE: {
          target: "VerifyPasskeyProvisioning",
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
