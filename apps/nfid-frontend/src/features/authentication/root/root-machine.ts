import { ActorRefFrom, assign, createMachine } from "xstate"

import AuthWithEmailMachine from "frontend/features/authentication/auth-selection/email-flow/machine"
import AuthWithGoogleMachine from "frontend/features/authentication/auth-selection/google-flow/auth-with-google"
import { AbstractAuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import { ApproveIcGetDelegationSdkResponse } from "../3rd-party/choose-account/types"
import { SNS_STEP_VISITED } from "../constants"
import { checkIf2FAEnabled, shouldShowPasskeys } from "../services"

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
  showPasskeys?: boolean
  isEmbed?: boolean
}

export type Events =
  | { type: "done.invoke.AuthWithGoogleMachine"; data: AbstractAuthSession }
  | { type: "done.invoke.AuthWithEmailMachine"; data: AbstractAuthSession }
  | {
      type: "done.invoke.checkIf2FAEnabled"
      data?: { allowedPasskeys: string[]; email?: string }
    }
  | {
      type: "done.invoke.shouldShowPasskeys"
      data?: { showPasskeys: boolean }
    }
  | { type: "AUTH_WITH_EMAIL"; data: { email: string; isEmbed: boolean } }
  | { type: "CHOOSE_WALLET" }
  | {
      type: "AUTH_WITH_GOOGLE"
      data: { jwt: string; email: string; isEmbed: boolean }
    }
  | { type: "AUTH_WITH_OTHER"; data: { isEmbed: boolean } }
  | { type: "AUTHENTICATED"; data?: AbstractAuthSession }
  | { type: "BACK" }
  | { type: "CONTINUE" }
  | { type: "SKIP" }
  | { type: "DONE" }

export interface Schema {
  events: Events
  context: AuthenticationContext
}

const AuthenticationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3SYGFMx6BHsgAOyAEa0ANrXQBPAMQRieZrTzViBNbACyxSVLAB1WZmNhxAQQyY8iUCOKxZtFQ5AAPRAEYATABsTACcABw+wQDMAAwALJEA7D4ArP6hADQgcoiRkX5MscHBCcGxyQnRoWEBsQC+tZloWLiEJOSUNAzMAEpgULSw6BzI6G54usj0mOpgSipqGlrMHH0DQyNjHk4uo+5IXojxQbEBoaGxftHB5akZWYjJoQlMydFvfjHnVQEJ9Y22LSIZAoVDojCYNiwLDARnouzwCisAFUACoACQA+sYAJLojEAcQA8oT8QAZACiW2crj2oG8CD8jwKiUKyT8fh8sROoWSmWyCFCkWCTDeosiPmiPh5AT8fxATRw+CB7VBXQhtmhsPhiNRmJxeO65N0hJRlP22xp9n29L8sVCzISrPZnO5fj5viuQVeb1eZT8xTqDXlAKVbRBnXBkMwmoE2uReP1mJNaPJ3SpO021sQgXt8Ud12dXNOvPuCASqSYPgC1ceCQCuQqkTlCsBYY6YOYUdMWHxxGIUCMc1UTHUmm06qw3cwvf7RgmUxm6ctHnpPh84qYkXKkXCkTt0T8CXdAsCTCSyTCoUue8qPmbIdawPbat6AFtiOgwFGwHhRvQNioQ4LGOyxgO+n5LvCK6IFekQhNEMrJAEt4lIUx4SsEXqir6bIBvezShk+qrguSnhrOoUBWHgUzEBwOoJriSboqmkGZnS2anA6TockWPLHo2lbVtWgqXLEdYBPhiqPiqEbMKR5F4JR1GYLR9F6oxGLkgAGtiLAotiABy+IYlYBk8GihJpua1JQVmCCnD4LxPPE5SeleR6lvWsRMO5fjhMUPxFMEkmtkRskTvwv4MCMYAsMgr5gAAIrJQEjos45SP26hTlRNEcKxtIHAgKQJPk64ROywSepKdz8jUjnBFKMp+SUAQRCFhEyR2EU-n+MVxQlyUdgoYAcBwtFMCIUgjAAZrRr5MJl-R4Dlym0QVVrscVlRwT8bxnFUeSVG6pYJEKZ4nJc4SxJK5QSXKJBUPA+wtp14bdWwnDcHwAhCKIEjSLI-KODZbFFaV6EciKoo1RUwnnB10nvWqn1cBt0EIHax52iEQWYaVdpiRUySI8qyPgr0-SDMM8LztMqjo3ZzVnj8JTJEK4rlD42MVEwh6RPWVYJKV1zJCTQavUjz6RhqMKxmDFq2VtnHRHD1xnaEbVRCWdUHkwyFCikpxRHu4v-ARUvEZ2thTjOA5gIzW2vMcxSJDuRTrkhx7XQUosnJhhsyqTbZW0wb4fl+ti9dFSsgIrYP0mUjkfHmKS2qcmvoQhyTQ28e7Xarh7B2F3XyYMFG5Sp+XWRmhX0my+QHoUh7xJrqQefyFTPDDUoxF5AvF11arflF-6fgNSWyY7RUSuyBTREh1xlK7W7HvW0QvFVvc7cksRSoP5NyXgEDT6u5y7ZrjrrjtKSRN75xnsEtqHVceQIxLD5k9LDs18udm2sebAc88ZVTFlud2A96i1CAA */
  createMachine(
    {
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
            AUTH_WITH_OTHER: {
              target: "OtherSignOptions",
              actions: "assignIsEmbed",
            },
            AUTHENTICATED: {
              actions: "assignAuthSession",
              target: "End",
            },
          },
        },
        AuthWithGoogle: {
          invoke: {
            src: "AuthWithGoogleMachine",
            id: "AuthWithGoogleMachine",
            data: (_, event: Extract<Events, { type: "AUTH_WITH_GOOGLE" }>) => {
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
        EmailAuthentication: {
          invoke: {
            src: "AuthWithEmailMachine",
            id: "AuthWithEmailMachine",
            data: (context) => ({
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
              target: "checkSNSBanner",
              actions: "assignAuthSession",
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
              { target: "checkPasskeys" },
            ],
          },
        },
        TwoFA: {
          on: {
            AUTHENTICATED: {
              target: "checkSNSBanner",
            },
          },
        },
        checkPasskeys: {
          invoke: {
            src: (context) => shouldShowPasskeys(context),
            id: "shouldShowPasskeys",
            onDone: [
              {
                actions: "assignShowPasskeys",
                cond: "showPasskeys",
                target: "AddPasskeys",
              },
              { target: "checkSNSBanner" },
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
              target: "checkSNSBanner",
            },
          },
        },
        AddPasskeysSuccess: {
          on: {
            DONE: {
              target: "checkSNSBanner",
            },
          },
        },
        checkSNSBanner: {
          always: [
            {
              cond: "showSNSBanner",
              target: "SNSBanner",
            },
            { target: "End" },
          ],
        },
        SNSBanner: {
          on: {
            AUTHENTICATED: {
              target: "End",
            },
          },
        },
        End: {
          type: "final",
          data: (context) => ({ ...context }),
        },
      },
    },
    {
      guards: {
        isExistingAccount: (_, event) => !!event?.data?.anchor,
        isReturn: (_, event) => !event.data,
        is2FAEnabled: (_, event) => !!event.data,
        showPasskeys: (_, event) => {
          const showPasskeys = event.data?.showPasskeys
          if (showPasskeys === undefined) return true
          return showPasskeys
        },
        showSNSBanner: () => {
          const showBanner = localStorage.getItem(SNS_STEP_VISITED)
          return !Boolean(showBanner)
        },
      },
      actions: {
        assignAuthSession: assign((_, event) => ({
          authSession: event.data,
        })),
        assignVerificationEmail: assign((_, event) => ({
          verificationEmail: event.data.email,
        })),
        assignAllowedDevices: assign((_, event) => ({
          allowedDevices: event.data?.allowedPasskeys,
        })),
        assignEmail: assign((_, event) => ({
          email: event.data?.email,
        })),
        assignShowPasskeys: assign((_, event) => ({
          showPasskeys: event.data?.showPasskeys,
        })),
        assignIsEmbed: assign((_, event) => ({
          isEmbed: event.data?.isEmbed,
        })),
      },
      services: {
        AuthWithEmailMachine,
        AuthWithGoogleMachine,
        checkIf2FAEnabled,
      },
    },
  )

export type AuthenticationMachineActor = ActorRefFrom<
  typeof AuthenticationMachine
>
export type AuthenticationMachineType = typeof AuthenticationMachine
export default AuthenticationMachine
