import { ActorRefFrom, createMachine } from "xstate"

import { getIframeWebauthn } from "frontend/features/iframe/iframe-trust-device/services"
import { fetchWebAuthnPlatformCapability } from "frontend/integration/device"
import {
  registerDeviceWithSecurityKey,
  registerDeviceWithWebAuthn,
} from "frontend/integration/device/services"
import { hasSecurityKeyService } from "frontend/integration/identity"
import { isDeviceRegistered } from "frontend/integration/identity-manager/services"

export interface Context {
  isIframe: boolean
}

export type Events =
  | { type: "TRUST" }
  | { type: "END" }
  | { type: "DONT_TRUST" }
  | { type: "done.invoke.isDeviceRegistered"; data: boolean }
  | { type: "done.invoke.fetchWebAuthnPlatformCapability"; data: boolean }
  | { type: "done.invoke.hasSecurityKey"; data: boolean }
  | { type: "done.invoke.checkIframeSelect"; data: boolean }

// Trust device on iFrame mode
// ===========================
// - [+] setup event listener to receive device data from popup window
// - [+] when click on trust device, open popup window with new screen
// - [+] explain to the that we need to create a new WebAuthn credential
// - [+] when user clicks on `create credential`, the WebAuthN flow starts
// - [+] on success we're sending the device data to the window opener
// - [+] the window closes and sends the user back to the original screen
// - [+] the event listener receives the device data and stores it as access point
// - [+] the flow continues like normal

export const TrustDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBUBOBXWAXAImAbgJYDGYAsgIbEAWhAdmAHQDC1YxA1sxQA4UBGhADaEsAT0ZpMWSAGIIAewaN6+BRyaFYeIqQBKYKFpmpIiUDwWxRhJeZAAPRAFYAjADZGATi-uvABgAWV2CAdgBmACZXABoQMUQvAA5I7yD3Z3dw51Ckr2cAXwK4qWwdEnIqWmVWdi5eAWFRCQB1MH4AQXQsajp5JU06NQ1GADMwLBo2zu7e7j5BEXF7S2ssWzp7BIQ8wMYojNdw-2ckwIz3OKcEQPDQ71CfJPSk0MLikFLcAgrKGnomLVOPNGksJABldjoVDNADSYDE-WUqnUTGoFFgkOI0LhCJWVhsdiQjhcHm8vgCwTCUVi8UQrlczlSjzOgTZp38-i8oSKJQwZR+pD+1SYkKE7CwsmQegAquDkPi1ht7NdXKE9gFwq5IklnPkcpFTnFtpFQq5GGz-O5GR4QmyPLzPvzvrpKv9lGKJbIcAB5AByyAA+tK5QriatCZtiar1WktTq9c4DUa6QgAuS7oEku51ZFTeEvI6vuUhVUAYxPcRJQBRP04RWRlWIAC0+X2kSCOVcyTZOdCxsQoQijA7SVc-htAUZRedJbdIsYBiM2DAqCRg2GTHGk2o0y6PToIMWzQb6yJoGuOec3j1gSZuVN+S8A4Q0X8Fsefi1uTV7z50jnYVyyXYxVznFpRF3dp916dcVCGVFGFMZcTHAyC91mKMLAJM8sJJG5MnJPwghCNUaUuVNGRyRhXDyKjaOccJshnADBXnYDDFA1A0J6DCD1kVdUAUVBGB4IQKCwUZhIAWyQziV24tiIN46DMNPZVo0QYJUmSTlx2SLIdVpbYPH8cJGGcO8GTzDxTj-J1WNdIDlBAhSeOoLEcXEeFEUUZEEJGZC1lXZSPKhGFvLxcMcI0i8tLcIjKVIiJogo7Z3DvRhXn8U1gmOO9XiKD46AUCA4HsYs2OcwE2GBBpj3ESRnTMaKlXPfCUhfcdwiSEcvGiZ4zROJJwncFiBScssalq+oFiaRq+N6dT2uuTrU12dtDmOU5zkycaXV+KaarqI95ohcLcW2bC2rw1VogtPVRtCTlQkibIUxM2jUkNB8nnVXN9sAo6WBm06wUYas6AgZbbsQPNUkCdJ+rcBlLJCF8UmvJjcvcTkpwZQGquBoFZtBE9WsbTSEA+wdGP2KJXpSNUsmSQnJvdUUwHFKsYabG5IhfH6Rwyq1RoZIdnjGj5KvZhdXJMXmqdNa9fENLMMvHLIIkF01vFuV7TgLbGIjZw6OcXeTUKU9DVIPRW4up-tKLccy-DzKIkzHSI71N0tzflsDrZ6TyIrEHz7fwpkX1x1I7nCQJImtJlcZG332OUSHoYp3C+Yl7xaKHDLuR8DKuo7e51TOSzkiYgskjT6qI+uZsGS8dtOzNHtziHLrep8TMImcTkcqCIqCiAA */
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
                    target: "WebAuthnPlatformCapability",
                  },
                ],
              },
            },
            WebAuthnPlatformCapability: {
              invoke: {
                src: "fetchWebAuthnPlatformCapability",
                id: "fetchWebAuthnPlatformCapability",
                onDone: [
                  {
                    cond: "bool",
                    target: "#TrustDeviceMachine.Select",
                  },
                  {
                    target: "SecurityKey",
                  },
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
                    target: "#TrustDeviceMachine.CheckIframeSelect",
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
              target: "CheckIframeSelect",
            },
            DONT_TRUST: {
              target: "End",
            },
            END: {
              target: "End",
            },
          },
        },
        CheckIframeSelect: {
          invoke: {
            src: "checkIframeSelect",
            id: "checkIframeSelect",
            onDone: [
              {
                cond: "bool",
                target: "IframeSelect",
              },
              {
                target: "Register",
              },
            ],
          },
        },
        IframeSelect: {
          invoke: {
            src: "getIframeWebauthn",
            id: "getIframeWebauthn",
            onDone: "End",
          },
        },
        Register: {
          invoke: {
            src: "fetchWebAuthnPlatformCapability",
            id: "fetchWebAuthnPlatformCapability",
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
            onError: [
              {
                target: "RegisterDeviceWithWebAuthn",
                internal: false,
              },
            ],
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
        fetchWebAuthnPlatformCapability,
        registerDeviceWithWebAuthn,
        registerDeviceWithSecurityKey,
        hasSecurityKey: hasSecurityKeyService,
        checkIframeSelect: async (context) => context?.isIframe ?? false,
        getIframeWebauthn,
      },
      guards: {
        bool: (_, event) => event.data,
      },
    },
  )

export type TrustDeviceActor = ActorRefFrom<typeof TrustDeviceMachine>

export default TrustDeviceMachine
