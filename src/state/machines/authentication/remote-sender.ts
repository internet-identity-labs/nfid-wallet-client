import { ActorRefFrom, assign, createMachine } from "xstate"

import { AuthSession } from "frontend/state/authentication"

import KnownDeviceMachine from "./known-device"
import RegistrationMachine from "./registration"

interface Context {
  pubsubChannel: string
  authSession?: AuthSession
}

type Events =
  | { type: "done.invoke.known-device"; data: AuthSession }
  | { type: "done.invoke.unknown-device"; data: AuthSession }
  | { type: "done.invoke.registration"; data: AuthSession }
  | { type: "done.invoke.post-delegate"; data: void }

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
      initial: "IsDeviceRegistered",
      states: {
        IsDeviceRegistered: {
          always: [
            {
              cond: "isDeviceRegistered",
              target: "KnownDevice",
            },
            {
              target: "RegistrationMachine",
            },
          ],
        },
        KnownDevice: {
          invoke: {
            src: "KnownDeviceMachine",
            id: "known-device",
            data: () => ({
              // FIXME: replace mock
              profile: { anchor: 10042 },
              authRequest: {
                hostname: "application.com",
              },
              authAppMeta: {
                name: "myapp",
                logo: "whatever",
              },
            }),
            onDone: [
              {
                actions: "assignAuthSession",
                target: "End",
              },
            ],
          },
        },
        RegistrationMachine: {
          invoke: {
            src: "RegistrationMachine",
            id: "registration",
            onDone: [
              {
                actions: "assignAuthSession",
                target: "End",
              },
            ],
          },
        },
        End: {
          invoke: {
            src: "postDelegate",
            id: "post-delegate",
          },
          type: "final",
          data: (context) => context,
        },
      },
    },
    {
      guards: {
        isDeviceRegistered: () => false,
      },
      services: {
        KnownDeviceMachine,
        RegistrationMachine,
        postDelegate,
      },
      actions: {
        assignAuthSession: assign((context, event) => {
          const authSession = event.data
          console.log(">> RemoteSenderMachine action assignAuthSession", {
            authSession,
          })

          return {
            authSession,
          }
        }),
      },
    },
  )

export type RemoteSenderActor = ActorRefFrom<typeof RemoteSenderMachine>
export type RemoteSenderMachineType = typeof RemoteSenderMachine

export default RemoteSenderMachine
