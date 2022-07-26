import { ActorRefFrom, createMachine } from "xstate"

import { fetchWebAuthnCapability } from "frontend/integration/device"
import {
  registerDeviceWithSecurityKey,
  registerDeviceWithWebAuthn,
} from "frontend/integration/device/services"
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
  | { type: "done.invoke.fetchWebAuthnCapability"; data: boolean }

export const TrustDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBUBOBXWAXAImAbgJYDGYAsgIbEAWhAdmAHQDC1YxA1sxQA4UBGhADaEsATwDEEAPYNG9fNI5NiFOgCEwaTFkiJQPabFGFZ+kAA9EAWgBMATkYBmAKxuADADYA7E88AOABZbV38AGhAxRFt-RhdbF0D7AEYXZL9koNsAX2yI7Ww8IlJKGnomAGUwIXYsCWQAJQBVCuRzQ2MsUzpzKwQne0C4r1tvd3d-eNdvbwiohH93RiTfZO9Pe3c1+1scvJAC3AIScipaOSqa4jqcAHkAOWQAfUaWtqQQDpMzD77d5OW9m8yU8gWCfkCY08c2iWziLn8-m8g0Gbm8-k8uXyGEKxxKZ3KjAaYCghGwYFQAHVRNRKWB+ABBdBYah0KSyJgKJRMVAksm6Kk0umM5ms9pGb49X6IdLJJa2EYueyLdyDPww-pOWyMOUpIHpdzeFzjJxYg44o7FU5lOTE0nkwUsqrEdCoURiADSYEkMjkXOUjF5UE6FOpTvYrvdXvmBglXR+oD6yRB2qc-nsbk8tk8bn8tg1a28jGz3jBTicSQ2qNy+zo0ggcHMhyKJ1K5yYrHYXF4AmE7vFnW6vRsYJcjH163LqVsqUNGusTmW60NCJc6zSbmSgTNzbx1vbjEutQHkuHCF2nmc-lSLk8oPcTi3II11-HWxCMwzY1XO4tLfxNpMHa-KhkK9JMiyUqxoOCaWIgARLCkkxpPYnjbIM86pEu6ToqqSreKM16-jo-77oSwEOmG1DOpG4jRie8ZQXBCDLowXgEcEiKqsq0KRDK5bFt+iRpuM9gDKa+y7labaEgAonQEAMUO0rngJIRiRWkJJMaawaqMjgTLegTuGCmQhOWxG4tJBIMEpsF9NYgQbOOwKTo+8SzrMfEINYiLLDm6SeOxmwPnsuRAA */
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
            TRUST: "Register",
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
            onDone: "End",
          },
        },
        RegisterDeviceWithSecurityKey: {
          invoke: {
            src: "registerDeviceWithSecurityKey",
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
        async canBeTrusted() {
          // FIXME:
          // Given: device doesn't support webauthn
          // Then: we fetch security devices
          // When: no security device is registered on users anchor
          // Then: we should ask for RegisterSecurityDevice (currently integrated in TrustDeviceCoordinator)
          //
          // return !isDeviceRegistered() && (await fetchWebAuthnCapability())
          return !isDeviceRegistered()
        },
        fetchWebAuthnCapability,
        registerDeviceWithWebAuthn,
        registerDeviceWithSecurityKey,
      },
      guards: {
        bool: (_, event) => event.data,
      },
    },
  )

export type TrustDeviceActor = ActorRefFrom<typeof TrustDeviceMachine>

export default TrustDeviceMachine
