import { ActorRefFrom, createMachine } from "xstate"

import { fetchWebAuthnCapability } from "frontend/integration/device"
import { isDeviceRegistered } from "frontend/integration/identity-manager/services"
import { RemoteDeviceAuthSession } from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

export interface Context {
  secret: string
  authSession?: RemoteDeviceAuthSession
  authRequest?: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
}

export type Events =
  | { type: "TRUST" }
  | { type: "DONT_TRUST" }
  | { type: "done.invoke.canBeTrusted"; data: boolean }

export const TrustDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBUBOBXWAXAImAbgJYDGYAsgIbEAWhAdmAHQDC1YxA1sxQA4UBGhADaEsATwDEEAPYNG9fNI5NiFOgCEwaTFkiJQPabFGFZ+kAA9EAWgDMAVgDsjAEwBONwDYAHLZcOXABZHAEYAGhAxREDvT1cfW09HRxd7PzdvAF9MiO1sPCJSShp6JgBlMCF2LAlkACUAVTLkc0NjLFM6cysEEMdAxm83AAZ7Dz9Qz0DgiKiEF0dvRlsYrwdbXzdHN2zcjHyCEnIqWjkKquIanAB5ADlkAH16ppakEDaTMzeevoGh0fGCxCUxmkWi9iWyWCgWGHmGKwhuxAeVwhyKJ1KjAAkrAyNJBFUAOpgfgAQXQWGodAkrSMny630Q9kCLkYk2GjnsIUCIS2nlss0QLj6jBhgTctgcIwybkCniRKIKR2KpyYdTAUEI2DAqEJomoxLJFKpUlkTAUSiYqA1Wt0uv1hvJlIZBjpHS+oB+vPsjA8KW8zK5Q0F80Wy1WMRc-NlLgV+1RhWOJTk6s12vtlIqxHQqFEYgA0mBJDI5BblIxrVB2jq9Zn2Dm84W5q72p1uogQt7fVsXAHAkG3CGQitRSzPBLbKNPCFYtkciA6NIIHBzIq0UnVSw2JxuHwCXnaa2PZYbNMfVs+vzbCF7ML7ByQ3ZRY5PByIU5PFz7FzAnGdEr0WTcpKmqQ96XbBAWRDXthkYe9x2ZFlbE5Jw-wORMVUxHE8QJMBHWNF13jdNtGQQPxWScXs3HsHxeW5YdoJScN72QtwYNSNCE2VDEUxtdNawNEknSpMD3UInptjiYZ-ElDJeT7AUwXmEdvGSMZvF8bx-G5LJ5zXDCeLVPi7QErMG3EJtRJIz1EEkxhpMlWw5IyZlFLmEZfVCFYNm2EZvGGeU9PjACN0xABROgICs48fjlAYZ36YFhmHDw+kY1kEQC7xgnHRJZU4kLMIYaLxNPcdPMvSUbzvB8lOsF9R36SS3GHJJxznTIgA */
  createMachine(
    {
      tsTypes: {} as import("./trust-device.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "TrustDeviceMachine",
      initial: "CheckCapability",
      states: {
        CheckCapability: {
          invoke: {
            src: "canBeTrusted",
            id: "canBeTrusted",
            onDone: [
              {
                cond: "bool",
                target: "Select",
              },
              {
                target: "End",
              },
            ],
          },
        },
        Select: {
          on: {
            TRUST: "IsMobileWebAuthn",
            DONT_TRUST: "End",
          },
        },
        IsMobileWebAuthn: {
          always: [
            {
              cond: "isMobileWebAuthn",
              target: "RegisterWithWebAuthn",
            },
            {
              target: "RegisterWithSecurityKey",
            },
          ],
        },
        RegisterWithWebAuthn: {
          invoke: {
            src: "registerWithWebAuthn",
            id: "registerWithWebAuthn",
            onDone: "End",
          },
        },
        RegisterWithSecurityKey: {
          invoke: {
            src: "registerWithSecurityKey",
            id: "regsiterWithSecurityKey",
            onDone: "End",
          },
        },
        End: {
          type: "final",
        },
      },
    },
    {
      services: {
        async canBeTrusted(context, event) {
          return !isDeviceRegistered() && (await fetchWebAuthnCapability())
        },
      },
      guards: {
        bool: (_, event) => event.data,
      },
    },
  )

export type TrustDeviceActor = ActorRefFrom<typeof TrustDeviceMachine>

export default TrustDeviceMachine
