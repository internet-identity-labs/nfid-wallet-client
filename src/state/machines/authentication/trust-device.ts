import { ActorRefFrom, createMachine } from "xstate"

import { fetchWebAuthnCapability } from "frontend/integration/device"
import {
  registerDeviceWithSecurityKey,
  registerDeviceWithWebAuthn,
} from "frontend/integration/device/services"
import { fetchProfile } from "frontend/integration/identity-manager"
import { isDeviceRegistered } from "frontend/integration/identity-manager/services"
import { fetchAuthenticatorDevices } from "frontend/integration/internet-identity"

export interface Context {}

export type Events =
  | { type: "TRUST" }
  | { type: "DONT_TRUST" }
  | { type: "done.invoke.isDeviceRegistered"; data: boolean }
  | { type: "done.invoke.fetchWebAuthnCapability"; data: boolean }
  | { type: "done.invoke.hasSecurityKey"; data: boolean }

export const TrustDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBUBOBXWAXAImAbgJYDGYAsgIbEAWhAdmAHQDC1YxA1sxQA4UBGhADaEsAT0ZpMWSAGIIAewaN6+BRyaFYeIqQBKYKFpmpIiUDwWxRhJeZAAPRAFYAjADZGATi-uvABgAWV2CAdgBmACZXABoQMUQvAA5I7yD3Z3dw51Ckr2cAXwK4qWwdEnIqWmVWdi5eAWFRCQBldnRUZoBpMDF5JU06NQ1GagpYNuIO7t77S2ssWzp7JwQ3Tx8-IJDXCOi4hIRXV2dU0OTAy8DnJP9-L1CikowyggrKGnomNqF2LFlkHoAKotZBzKw2OxIRyIXaBNLhVyRJLOfI5SI3A6ISKhVyMS7+dwnDwhS4eJ4gUq4N6kD7Vb5gX7Ef44ADyADlkAB9QEgsHQ+aQ5bQ1ZwhFIlFo0IYpJYhABbxecKhQJJdwqyI48JeClU8q0qpfRgGIzYMCofrKVTqJgAMzAWBoAHUwPwAILoLDUOjcPiCETicELJYrRDq5zeVHXHEpc6ouXRfz485+RG5XaFYqUl7U3SVT7KE3Gc36sBO0TUF3uz3ey2DYZMUymkyl8teqser3CiwQxZQ0Cra4bXwBYJhKIeOUnHKMVx5adz5zhbK6nOlulGotm1CtiuTabiHp9RRWoY2xhNhbmtvUfedQ+zAW9kMixDXPGbUc7PaT+Jh66MEkoT+DiwThEENyPBSdAKBAcD2HqNL5vSLBsJwvqNAGEhUmYT7Bv2MIICkU7+OESSMJEXjRLcuL+Dc4TuKu0jroaNRofUfpNOIjAdjW3YgIKfb8asxF-kRXjwlEGSuOBNyBBkjFZoheYbmxdQYf6zSMHeMyHD2+HCbC0T4qiDHAf40rZJiYnHCkFE5CkPhAYEGpMa8KmsUwtToQ0mncQAonQEBBkKoYIJqqSBOkVFuMczhjnKKQRsuoHuHcATHK4bm5u8nmoepvlcXpAnPgRqzWYcoSnIwy4BP4rhUZKdHZSxBYMkyWAhUJYWBJECYzpE7hRVkRK7LkhItUhqlMFuJhdS+A7YlV3juBiqpDa4hLKuECY4t4gTKjK2opREk0eW1xqGMWO5ITevFdvNZUuKEU5uOEjB+JqUTODcSLXGduUXbNJa3Xu7T3mIR6PYZax9WJaWpNtvVEqcaVJOEAMGhdgXBXhoWvggoS5N4c5E0NDybIEU6RBZjAqkk1yBMky7akkmPIV80NhXOU7kXc-MCwLGNFAUQA */
  createMachine(
    {
      tsTypes: {} as import("./trust-device.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "TrustDeviceMachine",
      initial: "CheckCapability",
      states: {
        CheckCapability: {
          initial: "Trusted",
          states: {
            Trusted: {
              invoke: {
                src: "isDeviceRegistered",
                id: "isDeviceRegistered",
                onDone: [
                  {
                    cond: "bool",
                    target: "#TrustDeviceMachine.End",
                  },
                  {
                    target: "WebAuthn",
                  },
                ],
              },
            },
            WebAuthn: {
              invoke: {
                src: "fetchWebAuthnCapability",
                id: "fetchWebAuthnCapability",
                onDone: [
                  { cond: "bool", target: "#TrustDeviceMachine.Select" },
                  { target: "SecurityKey" },
                ],
              },
            },
            SecurityKey: {
              invoke: {
                src: "hasSecurityKey",
                id: "hasSecurityKey",
                onDone: [
                  {
                    cond: "bool",
                    target: "#TrustDeviceMachine.End",
                  },
                  {
                    target: "#TrustDeviceMachine.Select",
                  },
                ],
              },
            },
            End: {
              type: "final",
            },
          },
        },
        Select: {
          on: {
            TRUST: {
              target: "Register",
            },
            DONT_TRUST: {
              target: "End",
            },
          },
        },
        Register: {
          invoke: {
            src: "fetchWebAuthnCapability",
            id: "fetchWebAuthnCapability",
            onDone: [
              {
                cond: "bool",
                target: "RegisterDeviceWithWebAuthn",
              },
              {
                target: "RegisterDeviceWithSecurityKey",
              },
            ],
          },
        },
        RegisterDeviceWithWebAuthn: {
          invoke: {
            src: "registerDeviceWithWebAuthn",
            id: "registerDeviceWithWebAuthn",
            onDone: [
              {
                target: "End",
              },
            ],
            onError: {
              target: "RegisterDeviceWithWebAuthn",
            },
          },
        },
        RegisterDeviceWithSecurityKey: {
          invoke: {
            src: "registerDeviceWithSecurityKey",
            id: "regsiterWithSecurityKey",
            onDone: [
              {
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
      services: {
        isDeviceRegistered: async () => isDeviceRegistered(),
        fetchWebAuthnCapability,
        registerDeviceWithWebAuthn,
        registerDeviceWithSecurityKey,
        async hasSecurityKey() {
          const profile = await fetchProfile()
          const usersAuthenticatorDevices = await fetchAuthenticatorDevices(
            BigInt(profile.anchor),
          )
          return (
            usersAuthenticatorDevices.findIndex(
              (x) => "cross_platform" in x.key_type,
            ) >= 0
          )
        },
      },
      guards: {
        bool: (_, event) => event.data,
      },
    },
  )

export type TrustDeviceActor = ActorRefFrom<typeof TrustDeviceMachine>

export default TrustDeviceMachine
