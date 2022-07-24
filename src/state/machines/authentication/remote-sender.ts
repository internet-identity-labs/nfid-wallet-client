import { ActorRefFrom, assign, createMachine } from "xstate"

import { getDataFromPath } from "frontend/apps/inter-device/services"
import { postRemoteDelegationService } from "frontend/integration/identity/services"
import { AuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
  ThirdPartyAuthSession,
} from "frontend/state/authorization"

import AuthorizationMachine, {
  AuthorizationMachineContext,
} from "../authorization/authorization"
import AuthenticationMachine from "./authentication"

interface Context {
  pubsubChannel: string
  authSession?: AuthSession
  appMeta: AuthorizingAppMeta
  authRequest?: AuthorizationRequest
}

type Events =
  | { type: "done.invoke.known-device"; data: AuthSession }
  | {
      type: "done.invoke.getDataFromPath"
      data: { authRequest: AuthorizationRequest; pubsubChannel: string }
    }
  | { type: "done.invoke.getAppMeta"; data: AuthorizingAppMeta }
  | { type: "done.invoke.authenticate"; data: AuthSession }
  | { type: "done.invoke.authorize"; data: ThirdPartyAuthSession }
  | { type: "done.invoke.postRemoteDelegationService"; data: void }

const RemoteSenderMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWgE5gFsB7dMbWMAOwjFwDoBJWAETADcBLAYzACUwoHWKXwQAxIlAAHIrA7oORSpJAAPRACYAbAGY6ARgAcAdgCsG4wE4Np6zYA0IAJ6J9lvaYAMAFi1mv3oaGWjYAvqGOaFh4hCRkFNS0dADSlEQA7pSsnDxiEEpgdByUbEQA1oVlaZnYNDlgKjJyCkoq6giW+sZ0pqY6GhqdOt6WXvqOLggaw3SWZp59njaeOsbepuGRGDj4xKTkVDT0-ILCuMgtlACyyFyYxWB5BUUl5YX4p+jnl42y8orKJBqRCdbq9fqDfTDUaecbOVwrOieHxaQymLSmeZjcIREBpGjwIFRHaxfYJI6MFjsbh8ARCESQX7NAFtRDeDQTTSBOjrXyWYKDXxafQbXHEmJ7eKHJKpDJZak8Jn-VpA9qmLo9dE6HRaXQ2LSjTlTfSeWao4yGTzGAYabzGHSirbRXZxA6JY50s4XAE3O4PJU-VWIUzc-R8wI6TwG3w6I2WU2WdxWMOJ9b6AabEDil1k6X0ACi1ADLKDCH05csPI0bgCier5iNJsMPMMlhCkZ1pkMOksmezpKl7uLKtA7SMjcMONCQA */
  createMachine(
    {
      tsTypes: {} as import("./remote-sender.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "auth-remote-sender",
      initial: "Start",
      states: {
        Start: {
          type: "parallel",
          states: {
            GetAuthRequest: {
              initial: "Fetch",
              states: {
                Fetch: {
                  invoke: {
                    src: "getDataFromPath",
                    id: "getDataFromPath",
                    onDone: [
                      {
                        actions: "assignAuthRequest",
                        target: "Done",
                      },
                    ],
                  },
                },
                Done: {
                  type: "final",
                },
              },
            },
            GetAppMeta: {
              initial: "Fetch",
              states: {
                Fetch: {
                  invoke: {
                    src: "getAppMeta",
                    id: "getAppMeta",
                    onDone: [
                      {
                        actions: "assignAppMeta",
                        target: "Done",
                      },
                    ],
                  },
                },
                Done: {
                  type: "final",
                },
              },
            },
          },
          onDone: "AuthenticationMachine",
        },
        AuthenticationMachine: {
          invoke: {
            src: "AuthenticationMachine",
            id: "authenticate",
            onDone: "AuthorizationMachine",
            data: (context, event) => ({
              appMeta: context.appMeta,
              authRequest: context.authRequest,
            }),
          },
        },
        AuthorizationMachine: {
          invoke: {
            src: "AuthorizationMachine",
            id: "authorize",
            onDone: "End",
            data: (context, event) =>
              ({
                authSession: event.data as AuthSession,
                appMeta: context.appMeta,
                authRequest: context.authRequest,
              } as AuthorizationMachineContext),
          },
        },
        End: {
          invoke: {
            src: "postRemoteDelegationService",
            id: "postRemoteDelegationService",
            data: (context) => context,
          },
          type: "final",
        },
      },
    },
    {
      guards: {},
      services: {
        AuthenticationMachine,
        AuthorizationMachine,
        postRemoteDelegationService,
        getAppMeta: () =>
          Promise.resolve({
            name: "MyApp",
            logo: "http://localhost:3000/favicon.ico",
          }),
        getDataFromPath,
      },
      actions: {
        assignAppMeta: assign((context, event) => ({
          appMeta: event.data,
        })),
        assignAuthRequest: assign((context, event) => ({
          authRequest: event.data.authRequest,
          pubsubChannel: event.data.pubsubChannel,
        })),
      },
    },
  )

export type RemoteSenderActor = ActorRefFrom<typeof RemoteSenderMachine>
export type RemoteSenderMachineType = typeof RemoteSenderMachine

export default RemoteSenderMachine
