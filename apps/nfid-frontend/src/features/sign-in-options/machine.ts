import { WebAuthnIdentity } from "@dfinity/identity"
import toaster from "packages/ui/src/atoms/toast"
import { ActorRefFrom, assign, createMachine } from "xstate"

import { FrontendDelegation } from "@nfid/integration"

import { checkRegistrationStatus } from "frontend/integration/identity-manager/services"
import { getIIAuthSessionService } from "frontend/integration/sign-in/internet-identity"
import {
  checkTentativeDevice,
  createTentativeDevice,
} from "frontend/integration/signin"
import { AuthSession, IIAuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

export interface IIAuthenticationMachineContext {
  anchor: number
  appMeta?: AuthorizingAppMeta
  authSession: AuthSession
  isRegistered?: boolean
  verificationCode?: string
  userIdentity?: WebAuthnIdentity
  frontendDelegation?: FrontendDelegation
  loading?: boolean
}

export type Events =
  | { type: "done.invoke.getIIAuthSessionService"; data: IIAuthSession }
  | {
      type: "error.platform.getIIAuthSessionService"
      data: { message: string }
    }
  | { type: "done.invoke.checkTentativeDevice"; data: boolean }
  | { type: "done.invoke.createTentativeDevice"; data: AuthSession }
  | { type: "done.invoke.checkRegistrationStatus"; data: boolean }
  | { type: "NEW_NFID" }
  | { type: "EXISTING_NFID" }
  | { type: "CONNECT_WITH_ANCHOR"; anchor: number }
  | { type: "CONNECT_WITH_RECOVERY" }
  | { type: "CREATE_NEW_ANCHOR" }
  | { type: "CONNECT_RETRY"; verificationCode: string }
  | { type: "RECOVER_II_SUCCESS"; data: AuthSession }
  | { type: "BACK" }
  | { type: "ASSIGN_USER_DEVICE"; data: WebAuthnIdentity }
  | { type: "ASSIGN_FRONTEND_DELEGATION"; data: FrontendDelegation }
  | {
      type: "End"
      data: { authSession: IIAuthSession; isRegistered: boolean }
    }

export interface Schema {
  events: Events
  context: IIAuthenticationMachineContext
}

const AuthWithIIMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEECuAXAFgdQJZYEkCBZAQwGNNcA7MAOgOvzSz0IIGIA5AUWwH0uAMQIARANoAGALqJQABwD2sfLkXU5IAB6IATLoCsdAOwA2AIwHjugCxXrlgDQgAnnqt0AHAE5PB08ae5rqS5t4AzAC+kc4sOPiYRGSUNPSMzBjx7Bw8ABoEAMoAKgRcAOKCIhIymkoq6GoaSNqI5uZekuGSkjaBNqa65j7ObggGnpJ0g779NpK63sY25tGxmWyJJBRUtAxM6HEbRBwAQsgAwgDSUrLNdarqmjoI+u2Sft42QeGffqYGI0QBjadF6A1MnlMvneQVWIEOCSS21SDAI5wATmBSOgwFwwAB3YRiDjnADyXF45yK-GwBCKAAl+MguOd6aSAEo3WrKB5NUDPUySUx0cIBIZDAw9f42QEIczhGx0bzK7y6TzhKwGFXGOEI9jJHZpNGY7G4glE0Qk8mU6m0hn8dk8MkANR47IAmly7jyGo9ms8fMLdKLVfM2pIVbKbMG6JZQhYbArJFYVjF4etEVsUrsiBisTi8YSqiTHcgijxBHwmSy2Zyat76o0nogNYqFW0wqZTMtJcZZVr2hDgZLBsFjBrdRn9cic8b82ai8SzlcvQofU3-XpPJ4vGrzInlcZVW1ZZ5jLGu-9PsZzMZOuEomm9ZsDSiiEUqOiIAAFUjo9AuBwEDqPQNAAG6KAA1vQKhQNQjBHIUYDomBuDkGAq4gPcvp8i0cqGJMATeAMPzEX4niyuECxKmeixDFCng2N45imJOrCZq+s7nOotDkAc1CUIo6JWhSTrUo6RQeph2EbvyrQEXQREkcqQ4Ua4rThOeTGHkKaoQqEj5rOx07Zka3HULx-GCcJy7XPWa6Nn6ckIGYO6MaKZ66P8AzAqeuhKiq26BIKzERGxWQvjOZk8WAfHIAJmBCdxEBgKcFx2bcDm8s2co-FpgzjomhjbuMp5GNpnz-HGbTGDqT5TpFpmouysWKGByEuN+mDoqQsCpY6LpuvwRD8AUACq5znDwBQFNJ65OXhwSSopR7KWRpXqS8Qy7vKvhQmq-h1UZEVIk1RAteQbUdV1PV9WlK72Vh824c8rleImELWN5hjmLKwbhEqZg-P4Bj+ExdVptQigpfAzTPqdhp7BkxmbNyjkvYg0ayr4F5drYia9MGAThYhnFmSaBbmlUaPZZuCCaeeWo+P95jdPKuhRjG1W9JpuiBGYR3pijCNvnSn4-n+AE0zhOU-MKYSQvo8ymOEEwAptxjLV8bQhH4Ni9FqJMcVFqLmZZ8XWdLsl4cR3gmFCTE-KrXxY5tzFeA+hj+JC-iLEbJmI7mMVxQlSXQ2AVsLc8caEaE0aSJr+0atjbYPuEwQ9BMEafP7jWBwQF1XeinXdb1EcNrTzkRMKWoq0KzOs1qf3Rh0xE+f4Y4GIZQsnVmiM8NQECRxjcqSrH+4hInqrJ5tGoA2CCz+ER242LnIu0MPOUALSirGtveAYgxd4EJ6bVvwrdJf7PdpKZ6eNE0RAA */
  createMachine(
    {
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {} as Schema,
      initial: "InitAuthWithII",
      id: "auth-with-ii",
      states: {
        InitAuthWithII: {
          on: {
            NEW_NFID: {
              target: "IICreateNewNFID",
            },
            EXISTING_NFID: {
              target: "IIThirdParty",
            },
            BACK: {
              target: "End",
            },
          },
        },
        IICreateNewNFID: {
          on: {
            CONNECT_WITH_ANCHOR: {
              target: "IIConnectAnchor",
              actions: "assignAnchor",
            },
            CONNECT_WITH_RECOVERY: {
              target: "IIRecoveryPhrase",
            },
            CREATE_NEW_ANCHOR: {
              target: "IIThirdParty",
            },
            BACK: {
              target: "InitAuthWithII",
            },
          },
        },
        IIConnectAnchor: {
          on: {
            CONNECT_RETRY: {
              target: "IIConnectAnchorCode",
              actions: "assignVerificationCode",
            },
            ASSIGN_USER_DEVICE: {
              actions: "assignUserIdentity",
            },
            ASSIGN_FRONTEND_DELEGATION: {
              actions: "assignFrontendDelegation",
            },
            BACK: {
              target: "IICreateNewNFID",
            },
          },
        },
        IIConnectAnchorCode: {
          invoke: {
            src: "checkTentativeDevice",
            id: "checkTentativeDevice",
            onDone: {
              target: "IIConnectAnchorCodeLoading",
              actions: "assignLoading",
            },
          },
          on: {
            BACK: {
              target: "IIConnectAnchor",
            },
          },
        },
        IIConnectAnchorCodeLoading: {
          invoke: {
            src: "createTentativeDevice",
            id: "createTentativeDevice",
            onDone: {
              target: "End",
              actions: "assignAuthSession",
            },
          },
        },
        IIRecoveryPhrase: {
          on: {
            RECOVER_II_SUCCESS: {
              target: "End",
              actions: "assignAuthSession",
            },
            BACK: {
              target: "IICreateNewNFID",
            },
          },
        },
        IIThirdParty: {
          invoke: {
            src: "getIIAuthSessionService",
            id: "getIIAuthSessionService",
            onDone: {
              target: "CheckRegistrationStatus",
              actions: "assignAuthSession",
            },
            onError: {
              target: "IICreateNewNFID",
              actions: "handleError",
            },
          },
        },
        CheckRegistrationStatus: {
          invoke: {
            src: "checkRegistrationStatus",
            id: "checkRegistrationStatus",
            onDone: { target: "End", actions: "assignRegistrationStatus" },
          },
        },
        End: {
          type: "final",
          data: (context) => {
            return context.authSession
          },
        },
      },
    },
    {
      actions: {
        assignAnchor: assign((context, event) => ({ anchor: event.anchor })),
        assignUserIdentity: assign((context, event) => ({
          userIdentity: event.data,
        })),
        assignFrontendDelegation: assign((context, event) => ({
          frontendDelegation: event.data,
        })),
        assignAuthSession: assign({
          authSession: (_, event) => {
            console.debug("AuthWithIIMachine assignAuthSession", { event })
            return event.data
          },
        }),
        assignLoading: assign({
          loading: (_, event) => {
            return event.data
          },
        }),
        assignVerificationCode: assign((context, event) => ({
          verificationCode: event.verificationCode,
        })),
        assignRegistrationStatus: assign({
          isRegistered: (_, event) => event.data,
        }),
        handleError: (event, context) => {
          toaster.error(context.data.message)
        },
      },
      guards: {},
      services: {
        getIIAuthSessionService,
        checkRegistrationStatus,
        checkTentativeDevice,
        createTentativeDevice,
      },
    },
  )

export type AuthWithIIActor = ActorRefFrom<typeof AuthWithIIMachine>

export default AuthWithIIMachine
