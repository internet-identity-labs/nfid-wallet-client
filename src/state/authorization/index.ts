import { SignIdentity } from "@dfinity/agent"
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
import { assign, ActorRefFrom, createMachine, send } from "xstate"

import { AppMeta } from "frontend/integration/app-config"
import { fetchAppUserLimit } from "frontend/integration/app-config/services"
import { Persona } from "frontend/integration/identity-manager"
import {
  createAccount,
  fetchAccounts,
} from "frontend/integration/identity-manager/services"
import {
  fetchDelegate,
  login,
} from "frontend/integration/internet-identity/services"

export interface AuthSession {
  signIdentity: SignIdentity
  delegationIdentity: DelegationIdentity
  sessionKey: Ed25519KeyIdentity
  anchor: string
  // sessionType: "nfid/device" | "app/scoped"
  // sessionSource: "google" | "remote" | "self"
  // scope
}

export interface AuthorizationMachineContext {
  appMeta?: AppMeta
  session?: AuthSession
  userLimit?: number
  accounts: Persona[]
  authRequest?: {
    maxTimeToLive: number
    sessionPublicKey: Uint8Array
    hostname: string
  }
}

export type AuthorizationMachineEvents =
  | { type: "done.invoke.fetchAppUserLimit"; data: number }
  | { type: "done.invoke.fetchAccounts"; data: Persona[] }
  | { type: "done.invoke.fetchDelegate"; data: AuthSession }
  | { type: "done.invoke.login"; data: AuthSession }
  | { type: "done.invoke.createAccount"; data: Persona["personaId"] }
  | { type: "SINGLE_ACCOUNT" }
  | { type: "MULTI_ACCOUNT" }
  | { type: "UNLOCK" }
  | { type: "CREATE_ACCOUNT" }
  | { type: "SELECT_ACCOUNT"; data: Persona["personaId"] }
  | { type: "PRESENT_ACCOUNTS" }
  | { type: "LOGIN" }

export interface Schema {
  events: AuthorizationMachineEvents
  context: AuthorizationMachineContext
}

const AuthorizationMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgewE4EsAvMAOgGV1ld0BiCbAO1PwYDdsBrUgMzHQGNMAQQAOIgKqwwuADL4AtvnSJQI7LCX5GKkAA9EAWgAMJIwE4AjAA4AbAFYA7ABY7VgExvHAZgdmANCAAnohuRlYkXl5OXkZGDlbWdh5WAL4pAWhYeESk4gwANtj8HDTiAHIyAPIAwgDSOmoa6FoMOvoIXmZuJGY2Tr79Vg4OXhY2AcEISU4RPjZuTlaOoTZpGRg4BMQkAGJ8gkL8-NioDOiwdIzMbJw8+8JHJ2fwSCCNmtqv7VHhbgmhFl8Fk8bjGE0QFjiJCSZncXjsgPMVjMXjWIEymxyu3uh2Op3ONGqACUAKJCAAqJIA+kJqtVKuVyQ11B9Wl9EDYbOFel07JEuaDYeCEG5fD0vH8lksEZ07GiMdltnsBA88c8aGQSTISdVyTS6QyykzXu9mp9QO0EdzzDEzHarEYfF5hU5ARFbEk7PMjHYnDZUel0RtFaRlQdHviLgAFUmao36+mMsjMpotNocmwmSGZow2eJGMZGJzCyLhBJRSEOqVWWzy4NbUjVXBgZDoMC4p60TXa3UJw3G1Qss1si0QovdTl+hz+sxOJzmF1urweiwWJxdR2+OtZBskKPNqRnDuRjVanV62mJo0p1nphDOGbmRZuCWxeF9RcOd32Tze33+7dMW2fc4DAI8I3VYkyUpPtGRvYc70sL8UX-BxYmRNwUWFNx5mhN9cw8YZ30AkMSAAcT4AARMB8jAKBWxaS4mBIFh2C4EheBVajaPohCTSHNN2QQeYv2BAs7TMEYC18YU+jsHoHDsBFJysaJczSQMGGwCA4B0BVdwoKhlH41NzT0Qx4hIDw4h-NcLGXJThQcboX0iGJPAcMYEQsEjdzyQpingwTRymLxTHMNDbXMWEEmFBEvysOZPE6SFXTcXysTDVVOxeQdTJHcyRWcqzlxfPkC3LOxsP6cVJQSCxHHQuVA30rEmxbNtjzOIKzPaSEfAiSwPFnRT5y8cYgghNCej5WE+kk3NIgcDLgIPMD0C684eoK9ozChedHXMTxrBrKrJo6CUIns10GvmSEURW0gKPQbi6IYszTWCwr-xIddlLCY7xzi6wSDXZdeiU11VIDdYdyxEkGAgba70WcJnJcWFxsk9w11k1wFN9FElpEpxHuRoSDEhFzQmnJI7Ics7JmMEhp05PMjD+PlIQfDSUiAA */
  createMachine(
    {
      context: { accounts: [] },
      tsTypes: {} as import("./index.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      id: "authorize",
      initial: "Start",
      states: {
        Start: {
          invoke: {
            src: "fetchAppUserLimit",
            id: "fetchAppUserLimit",
            onDone: [
              {
                actions: "ingestUserLimit",
                cond: "authenticated",
                target: "FetchAccounts",
              },
              {
                actions: "ingestUserLimit",
                target: "Unlock",
              },
            ],
          },
        },
        Unlock: {
          on: {
            UNLOCK: {
              target: "Login",
            },
          },
        },
        Login: {
          invoke: {
            src: "login",
            id: "login",
            onDone: {
              actions: "ingestSession",
              target: "FetchAccounts",
            },
          },
        },
        FetchAccounts: {
          invoke: {
            src: "fetchAccounts",
            id: "fetchAccounts",
            onDone: [
              {
                actions: ["ingestAccounts", "handleAccounts"],
              },
            ],
          },
          on: {
            CREATE_ACCOUNT: {
              target: "CreateAccount",
            },
            SELECT_ACCOUNT: {
              target: "GetDelegation",
            },
            PRESENT_ACCOUNTS: {
              target: "PresentAccounts",
            },
          },
        },
        CreateAccount: {
          invoke: {
            src: "createAccount",
            id: "createAccount",
            onDone: "GetDelegation",
          },
        },
        PresentAccounts: {
          on: {
            SELECT_ACCOUNT: {
              target: "GetDelegation",
            },
            CREATE_ACCOUNT: {
              target: "CreateAccount",
            },
          },
        },
        GetDelegation: {
          invoke: {
            src: "fetchDelegate",
            id: "fetchDelegate",
            onDone: [
              {
                actions: "ingestSession",
                target: "End",
              },
            ],
          },
        },
        End: {
          type: "final",
        },
      },
    },
    {
      actions: {
        ingestSession: assign((context, event) => ({ session: event.data })),
        ingestUserLimit: assign({ userLimit: (context, event) => event.data }),
        ingestAccounts: assign({ accounts: (context, event) => event.data }),
        handleAccounts: send((context, event) => ({
          type:
            context.userLimit && context?.userLimit <= 1
              ? event.data.length
                ? "SELECT_ACCOUNT"
                : "CREATE_ACCOUNT"
              : "PRESENT_ACCOUNTS",
          data: event.data[0]?.personaId,
        })),
      },
      services: {
        fetchAppUserLimit,
        fetchAccounts,
        fetchDelegate,
        login,
        createAccount,
      },
      guards: {
        authenticated: (context) => !!context.session,
      },
    },
  )

export type AuthorizationActor = ActorRefFrom<typeof AuthorizationMachine>

export default AuthorizationMachine
