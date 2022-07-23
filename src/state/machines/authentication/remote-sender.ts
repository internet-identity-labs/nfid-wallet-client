import { ActorRefFrom, assign, createMachine } from "xstate"

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
  authRequest?: {
    hostname: string
  }
}

type Events =
  | { type: "done.invoke.known-device"; data: AuthSession }
  | { type: "done.invoke.getAuhtRequest"; data: { hostname: string } }
  | { type: "done.invoke.getAppMeta"; data: AuthorizingAppMeta }
  | { type: "done.invoke.authenticate"; data: AuthSession }
  | { type: "done.invoke.authorize"; data: ThirdPartyAuthSession }
  | { type: "done.invoke.done"; data: void }

async function postDelegate(): Promise<void> {
  console.log("TODO: Push delegate to pubsub channel")
  return undefined
}

const RemoteSenderMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCcwFsD2AXMBaWYAdhGMgHQCSsAImAG4CWAxmAEphQOw6oQDEiUAAcMsBlgYZCgkAA9EAVgBsZJQA4AzAE4FABgBMugCwBGE8q0AaEAE9EJpbrJazSkzrVa1Adk-eAvv7WqJg4+EQk5ADShBgA7oS0jCx8EFJgZAyEdBgA1hm5sQm4JMlgMiJiElIy8ghqRgpkuiZqDfpG3t66SkZq1nYI7hpkpg7uCp4+noHB6Nh4BMSkZOyc3MgAhtWEALKbTAAWWWCp6ZnZeRmo61hbOxWi4pLSSHKKulqjbSb6HVoAnomAaIbQjXQtNoKBRabwKP5GQJBECxEjwN4hBbhZbkKhJZhsDhcHiQR5VF61UFqMj6OG-DR-LRgtxGEEIJRfBRdExw3QaPmmBSzECYsJLSJkGLxRL0Alk541N51DRqEzOFpafQmDSNJQabwaDRshzUlzjDxeXxaRHI0WLCIrNbE+4vfZHE7yh5KxDeFRMpS+Qz6AGTNRKNkqpx6VpqaGw+EdYV27ESgCixE9FO9CC6IzUEMh+gDbgZEfzZGjUJhcIRSfmYodyEzitAdRMRhpdP0DODzPbbNwIyMf003mDJl0ygcWiR-iAA */
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
                    src: "getAuhtRequest",
                    id: "getAuhtRequest",
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
            src: "postDelegate",
            id: "done",
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
        postDelegate,
        getAppMeta: () =>
          Promise.resolve({
            name: "MyApp",
            logo: "http://localhost:3000/favicon.ico",
          }),
        getAuhtRequest: () =>
          Promise.resolve({
            hostname: "http://localhost:3000",
          }),
      },
      actions: {
        assignAppMeta: assign((context, event) => ({
          appMeta: event.data,
        })),
        assignAuthRequest: assign((context, event) => ({
          authRequest: event.data,
        })),
      },
    },
  )

export type RemoteSenderActor = ActorRefFrom<typeof RemoteSenderMachine>
export type RemoteSenderMachineType = typeof RemoteSenderMachine

export default RemoteSenderMachine
