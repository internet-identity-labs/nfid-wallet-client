import { DelegationIdentity } from "@dfinity/identity"
import { assign, createMachine } from "xstate"

import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"

interface Context {
  signIdentity?: DelegationIdentity
  googleIdentityExists?: boolean
}

type Events =
  | {
      type: "AUTH_WITH_GOOGLE"
      data: { identity: DelegationIdentity; isExisting: boolean }
    }
  | { type: "done.invoke.remote"; data: DelegationIdentity }
  | { type: "done.invoke.registration"; data: DelegationIdentity }
  | { type: "AUTH_WITH_REMOTE" }
  | { type: "AUTH_WITH_OTHER" }
  | { type: "TRUST_DEVICE" }
  | { type: "DONT_TRUST_DEVICE" }
  | { type: "INGEST_SIGN_IDENTITY"; data: DelegationIdentity }

function isMobileWithWebAuthn() {
  // Integration layer note: run async capability check initially and capture to memory.
  // Maybe make this an invokation to deal with async, while Philipp is sleeping.
  return true
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFmAduglgMbLpgC0qOA1jgPYDuOZEYAbkWAHQDK6yATugDEiUAAdasfAVo5RIAB6IATAGYAHJwAsqgOxaDAVkNb1ABkO7DAGhABPRAE4znR27eHVh5coCMANnUtAF9g2zQsXAJiUgpqOkZmNg5OACUwKHxYdH4SfFkAWWRCTHwcMCEIWS4y1loqLn4MrJy82XkJKRk5JEVEX0N1TV1dMzUNIMdTWwcEX19dR21HdV8zR39HX1Nlf1DwjGw8IhJyShoGJhZ2Qi4AQUPuMAAbMEJuoTuAVQAVAAkAPoAdQAkv8AQBxADyUIhABkAKIdSTSfI9UBKBCGMacMZbVT+LQrXx+MyqGYqfScPTzIlmXyTDYhMIgCJHaKnOIXRLXFIPLBPV7vNGfX6A0Hg1IIgpQn5I3qdVHtXqY5RTTi6fxmIaqebKLT6oIUhBaemcYzqUb6wwBYn7VmHKInWLnBJXZK3Tj8zCCt4fb7giWA2V-BGpZFdNHyTEbVxDVb+fw29RTGz2RCm3zmwbmUy+PSEpP2tlOmJneKXJI3e6HIHSTAQ2i0KCvEQKlHdaNOVTKTiWpOqHYLUxp2Zq1R93TzDSmLSa1RmZkHSLHMtct1VlLpAC2tFI3tLbRwlWqnFq9UaYF3pAjSvRfQQ-l1Gvpc+UZJWQ1HiGxmkchlTMxdGUSwtS0PYWRLVdOVdSteU9dJMmyMB+AAEQ9MB0MIfAWH4IRUKhAA5H4AR+VIvm4EjUIRAA1EEAGF5XEDsoxVRBLSWbVHBGRwCS0NYLGNLVNDMJNAmUIIxl8Rxi0daCXQrHkMLSZpkLQjCsJwlChDIiiqNohimJARVOzYuZ838bQQP4m0zCk9RjW8TQtAAlySUMRN1C8WSVw5BTuXdasVKQ0h1OrE9yjPHA6gaTgoL88sAs3BDVNC9DqwQc8YjRABtMwAF1b1MjF+jJLN+NE-x9CGA0FmNKwlh0AxdQZDyPNUHz2WdRKN3grhEJaFD0o4IQUP4Wh+E4MRnhIAAzCbtziuSEvXODlIGtThtuTLotobLZDywr20jZUSrmVQvE4AZ1AA4D9EXEZjTWG7XE1elvCffRdA6yDlu61alKCja0owhF+HGvDdMogFqLoxiitYs75m+3FBxJf9tlNfVjS8rQruxZxB1Exx3wg5curXWDAa3VKhtB8GJqEBFCNQhHTofXjGoWZxvt0VZ1DUJ7tUMV6tQGXY9DnH7ycPfzeuUhEFBaMooDuHASkZkFCIhBFoe4EEIUIgEQWo4iwQATTZ+9MUzTgQIZIYSa1DRPCE3ZzUHRZF3zOyZPtOgWHgXp4v+qnApSXgBHQK2uwQKlpJJgI+MCOr0wQIJzTsuz+LVLPFk62WerWoKERwCAY7Mt7qUWLZ8x1dZdCe6TeyJVZtQZAx+N0Av5KL6mUpC3JuiKEoyjACukaJFvvr0fVTF1fwm6zLO7L8C7nG1MmHV80PFPDz1vV9YV2ZMxGHwXFwDAsf8tg8oJyTTiTdGr2lgP8AZwL9mXe4B-eaywOsWBGzNleBPB8U5n6akTNsTYLlByL0fpaF+2w34f27r9HelM97JX6lePcYADzyTPqfdmqogLUjUKaAkVg5wjAcmnIklkXJTBaticCehpbbwpjBbBfVgqDTChwTSuEwGYhukw9w3hpIDGxN+LEfhXCuQugsPwTse4rTDjg-hm0MKiP6LqPGup1hzgsD4acxpGHaFcp4G0wEDDoO-ho3h61aaCNuGDCGei5iiWchJcCKCEwpiFosbQDVuLcxAoSdRu8kp8MVsrHAqt1aYAml43iGpZGDmUFOd+ehHBCVUEsTwc5HbXxTtErBsTdHHTvLHbEV03B+CfIWVYjc07zGWO4DhGw-DMNCKEIAA */
  createMachine(
    {
      tsTypes: {} as import("./unknown-device.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "auth-unknown-device",
      initial: "Start",
      states: {
        Start: {
          always: [
            {
              cond: "isMobileWithWebAuthn",
              target: "RegistrationMachine",
            },
            {
              target: "AuthSelection",
            },
          ],
        },
        End: {
          type: "final",
        },
        RegistrationMachine: {
          invoke: {
            src: "RegistrationMachine",
            id: "registration",
            onDone: [
              {
                actions: "ingestSignIdentity",
                target: "End",
              },
            ],
          },
        },
        AuthSelection: {
          on: {
            AUTH_WITH_GOOGLE: {
              actions: "ingestGoogle",
              target: "AuthWithGoogle",
            },
            AUTH_WITH_REMOTE: {
              target: "RemoteAuthentication",
            },
            AUTH_WITH_OTHER: {
              target: "ExistingAnchor",
            },
          },
        },
        AuthWithGoogle: {
          always: [
            {
              cond: "googleIdentityExists",
              target: "End",
            },
            {
              target: "RegistrationMachine",
            },
          ],
        },
        RemoteAuthentication: {
          invoke: {
            src: "RemoteReceiverMachine",
            id: "remote",
            onDone: [
              {
                actions: "ingestSignIdentity",
                target: "RegisterDeviceDecider",
              },
            ],
          },
        },
        RegisterDeviceDecider: {
          on: {
            DONT_TRUST_DEVICE: {
              target: "End",
            },
            TRUST_DEVICE: {
              target: "RegisterDevice",
            },
          },
        },
        RegisterDevice: {
          invoke: {
            src: "registerDevice",
            onDone: [
              {
                target: "End",
              },
            ],
            onError: [
              {
                target: "RegisterDeviceError",
              },
            ],
          },
        },
        RegisterDeviceError: {
          on: {
            TRUST_DEVICE: {
              target: "RegisterDevice",
            },
            END: {
              target: "End",
            },
          },
        },
        ExistingAnchor: {
          on: {
            INGEST_SIGN_IDENTITY: {
              actions: "ingestSignIdentity",
              target: "End",
            },
          },
        },
      },
    },
    {
      guards: {
        isMobileWithWebAuthn,
        googleIdentityExists(context) {
          return context.googleIdentityExists === true
        },
      },
      actions: {
        ingestGoogle: assign({
          signIdentity: (context, event) => event.data.identity,
          googleIdentityExists: (context, event) => event.data.isExisting,
        }),
        ingestSignIdentity: assign({
          signIdentity: (context, event) => event.data,
        }),
      },
      services: {
        RegistrationMachine,
        RemoteReceiverMachine,
      },
    },
  )

export default UnknownDeviceMachine
