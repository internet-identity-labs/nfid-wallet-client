import { ActorRefFrom, assign, createMachine } from "xstate"

import AuthWithEmailMachine from "frontend/features/authentication/email-flow/machine"
import AuthWithGoogleMachine from "frontend/features/authentication/google-flow/auth-with-google"
import { postDelegation } from "frontend/integration/windows/services"
import { AbstractAuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

export interface AuthenticationContext {
  shouldRedirectToProfile?: boolean
  authRequest: AuthorizationRequest
  authSession?: AbstractAuthSession
  appMeta?: AuthorizingAppMeta
  verificationEmail: string
}

export type Events =
  | {
      type: "done.invoke.AuthWithGoogleMachine"
      data: AbstractAuthSession
    }
  | {
      type: "done.invoke.AuthWithEmailMachine"
      data: AbstractAuthSession
    }
  | { type: "AUTH_WITH_EMAIL"; data: string }
  | { type: "AUTH_WITH_GOOGLE"; data: { jwt: string } }
  | { type: "END"; data: AbstractAuthSession }

export interface Schema {
  events: Events
  context: AuthenticationContext
}

const AuthenticationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3SYGFMx6BHsgAOyAEa0ANrXQBPAMQRieZrTzViBNbACyxSVLAB1WZmNhxAQQyY8iUCOKxZtFQ5AAPRAEYATABsTACcABw+wQDMAAwALJEA7D4ArP6hADQgcoiRkX5MscHBCcGxyQnRoWEBsQC+tZloWLiEJOSUNAzMAEpgULSw6BzI6G54usj0mOpgSipqGlrMHH0DQyNjHk4uo+5IXojxQbEBoaGxftHB5akZWYjJoQlMydFvfjHnVQEJ9Y22LSIZAoVDojCYNiwLDARnouzwCisAFUACoACQA+sYAJLojEAcQA8oT8QAZACiW2crj2oG8CD8jwKiUKyT8fh8sROoWSmWyCFCkWCTDeosiPmiPh5AT8fxATRw+CB7VBXQhtmhsPhiNRmJxeO65N0hJRlP22xp9n29L8sVCzISrPZnO5fj5viuQVeb1eZT8xTqDXlAKVbRBnXBkMwmoE2uReP1mJNaPJ3SpO021sQgXt8Ud12dXNOvPuCASqSYPgC1ceCQCuQqkTlCsBYY6YOYUdMWHxxGIUCMc1UTHUmm06qw3cwvf7RgmUxm6ctHnpPh84qYkXKkXCkTt0T8CXdAsCTCSyTCoUue8qPmbIdawPbat6AFtiOgwFGwHhRvQNioQ4LGOyxgO+n5LvCK6IFekQhNEMrJAEt4lIUx4SsEXqir6bIBvezShk+qrguSnhrOoUBWHgUzEBwOoJriSboqmkGZnS2anA6TockWPLHo2lbVtWgqXLEdYBPhiqPiqEbMKR5F4JR1GYLR9F6oxGLkgAGtiLAotiABy+IYlYBk8GihJpua1JQVmCCnD4LxPPE5SeleR6lvWsRMO5fjhMUPxFMEkmtkRskTvwv4MCMYAsMgr5gAAIrJQEjos45SP26hTlRNEcKxtIHAgKQJPk64ROywSepKdz8jUjnBFKMp+SUAQRCFhEyR2EU-n+MVxQlyUdgoYAcBwtFMCIUgjAAZrRr5MJl-R4Dlym0QVVrscVlRwT8bxnFUeSVG6pYJEKZ4nJc4SxJK5QSXKJBUPA+wtp14bdWwnDcHwAhCKIEjSLI-KODZbFFaV6EciKoo1RUwnnB10nvWqn1cBt0EIHax52iEQWYaVdpiRUySI8qyPgr0-SDMM8LztMqjo3ZzVnj8JTJEK4rlD42MVEwh6RPWVYJKV1zJCTQavUjz6RhqMKxmDFq2VtnHRHD1xnaEbVRCWdUHkwyFCikpxRHu4v-ARUvEZ2thTjOA5gIzW2vMcxSJDuRTrkhx7XQUosnJhhsyqTbZW0wb4fl+ti9dFSsgIrYP0mUjkfHmKS2qcmvoQhyTQ28e7Xarh7B2F3XyYMFG5Sp+XWRmhX0my+QHoUh7xJrqQefyFTPDDUoxF5AvF11arflF-6fgNSWyY7RUSuyBTREh1xlK7W7HvW0QvFVvc7cksRSoP5NyXgEDT6u5y7ZrjrrjtKSRN75xnsEtqHVceQIxLD5k9LDs18udm2sebAc88ZVTFlud2A96i1CAA */
  createMachine(
    {
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      id: "auth-machine",
      initial: "AuthSelection",
      states: {
        AuthSelection: {
          on: {
            AUTH_WITH_GOOGLE: {
              target: "AuthWithGoogle",
            },
            AUTH_WITH_EMAIL: {
              target: "EmailAuthentication",
              actions: "assignVerificationEmail",
            },
          },
        },
        AuthWithGoogle: {
          invoke: {
            src: "AuthWithGoogleMachine",
            id: "AuthWithGoogleMachine",
            data: (_, event: { data: { jwt: string } }) => {
              return { jwt: event.data.jwt }
            },
            onDone: [
              {
                cond: "isExistingAccount",
                actions: "assignAuthSession",
                target: "End",
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
            data: (context, _) => ({
              authRequest: context.authRequest,
              appMeta: context.appMeta,
              email: context.verificationEmail,
            }),
            onDone: [
              { cond: "isReturn", target: "AuthSelection" },
              {
                cond: "isExistingAccount",
                actions: "assignAuthSession",
                target: "End",
              },
              {
                actions: "assignAuthSession",
                target: "AuthSelection",
              },
            ],
          },
        },
        End: {
          type: "final",
          invoke: {
            src: "postDelegation",
            id: "postDelegation",
          },
          data: (context, event) => {
            console.debug("AuthenticationMachine End", {
              authSession: context.authSession,
              context,
              event,
            })
          },
        },
      },
    },
    {
      guards: {
        isExistingAccount: (context, event) => {
          return !!event?.data?.anchor
        },
        isReturn: (context, event) => !event.data,
      },
      actions: {
        assignAuthSession: assign({
          authSession: (_, event) => {
            console.debug("AuthenticationMachine assignAuthSession", { event })
            return event.data
          },
        }),
        assignVerificationEmail: assign({
          verificationEmail: (_, event) => {
            console.debug("AuthenticationMachine assignVerificationEmail", {
              event,
            })
            return event.data
          },
        }),
        // handleError: (event, context) => {
        //   toast.error(context.data.message)
        // },
      },
      services: {
        AuthWithEmailMachine,
        AuthWithGoogleMachine,
        postDelegation,
      },
    },
  )

export type AuthenticationMachineActor = ActorRefFrom<
  typeof AuthenticationMachine
>
export type AuthenticationMachineType = typeof AuthenticationMachine
export default AuthenticationMachine
