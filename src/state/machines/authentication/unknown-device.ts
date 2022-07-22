import { v4 as uuid } from "uuid"
import { ActorRefFrom, createMachine } from "xstate"

import { isMobileWithWebAuthn } from "frontend/integration/device/services"
import { GoogleDeviceResult } from "frontend/integration/lambda/google"
import {
  fetchGoogleDevice,
  isExistingGoogleAccount,
  signInWithGoogle,
} from "frontend/integration/lambda/google/services"
import {
  AuthSession,
  GoogleAuthSession,
  RemoteDeviceAuthSession,
} from "frontend/state/authentication"
import {
  AuthorizationRequest,
  AuthorizingAppMeta,
} from "frontend/state/authorization"

import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"
import { TrustDeviceMachine } from "./trust-device"

export interface UnknownDeviceContext {
  authRequest: AuthorizationRequest
  appMeta?: AuthorizingAppMeta
}

export type Events =
  | { type: "done.invoke.remote"; data: RemoteDeviceAuthSession }
  | { type: "done.invoke.registration"; data: AuthSession }
  | { type: "done.invoke.registerDevice"; data: AuthSession }
  | { type: "done.invoke.fetchGoogleDevice"; data: GoogleDeviceResult }
  | { type: "done.invoke.signInWithGoogle"; data: GoogleAuthSession }
  | { type: "done.invoke.isMobileWithWebAuthn"; data: boolean }
  | { type: "AUTH_WITH_GOOGLE"; data: string }
  | { type: "AUTH_WITH_REMOTE" }
  | { type: "AUTH_WITH_OTHER" }
  | { type: "END"; data: AuthSession }

export interface Schema {
  events: Events
  context: UnknownDeviceContext
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3SfszHoIBhZAAdkAI1oAbWugCeAYgjE8zWnmrECa2AFlikqWADqszMbDiAghkx5EoEcVizaKhyAAeiAKwAGAHYmPxC-ABYARj8ADgiAZh8fCIA2ABoQOUQIgE4AJiZouKK4sOTs8OifXLiAXxr0tCxcQhJyShoGZjZObl5+IVEJaVlFMA4OYg4mESlkdAAzSYBbJlo9A2kTMwtrW3skECcXdDd90G8EXIimeNzYq+SwgOyIiNz0zIQ4wqY4mIjorkAsD-LkfAE6g1bM0iGQKFQ6IwmAAlMBQNboDhzU66ZC8dRgJQqNQaLTMDhojFYk7uA5HVy086IMJxZJMUrRaJhXJ+bLgpLRD6+aJBfwhaoxMLRbLJCH1ECNHD4WFtBGdJg2LAsMBGeg0vAKKwAVQAKgAJAD6xgAkuaLQBxADyjvtABkAKIeen6jwXMHRdlxAJhPm5K5hDk+IUIQrZYKhPxxKIAnzJXKQhXQ5WteEdJGazDa3X6w2my02u3I926R0mz105wMs5eRC5KWB4Oh8Mc94ZLK8tlivz+MJVbLBjOKmE59qI5gFov8EvGu0Vy21s3u5Fexs+g5+5IBlmdqrdw9RvsIAJJG7JO8+EXJIoBROTrMtOGz9UF0xYe3EYgoCMVhaCgPBrQNZRVFWUltCYFwwIg39MH-QCjB3Y5Tl9LI03yJ9cjvPlgVibJoxeNkEyuEoAjbCI3yabNPzVfNbGQ1CgOYAAxMB0F4IloPUTQ4PmHjeHYowABE8zADCm2wmNsjCJgfCTAERSeJ872jSolOyPS9MKao-iTeilQ-VVpJRMAlmIdAwALMA8BOehsRUfiSSE8lrNsmSG0wxkWxjaomHKNNU3+Z4Q2jKIZWU0IRzHCd5SnRiLLnKz0VgOyOCkud3JgzymBS8zc3S1FMuy3LOgQQTiBc-UAG0-AAXVkvcmSvHk4oCaJHhyKpU0FS83hSOKQhoiIAlZOUoQYkqvyRcqMTGKrGAUMYJimGY5kWDgVmKlVSvVJaspW6SatJerTia1q-Lk-dW0BEK-Fw5IfEiR5YminIAxSWUEjDPxAZmzM5sOhbmBOyrpPdcZJgUE1kSNFgTQtCT3QANWtQR60cXcsIey4ntCsM3o+qUImits2T+mjUyfV5uVM6cmMsqGzrnWHNoUd0ADkJLagmOqBfISYI96Ugp6LWUHUJCkTMI-ABdNkvfcHmOYd1PAxdQoCsPBeHhvmBbu9rAre-I2zDBIAhyRT3ujW3Rf08psm+Ai3uZ1KjqRLWdbwPWDcweGV3LW113NLdBYCg8jyDENTwiCNz0dxNbzvQ84h5DTkjqeUSCoeADgOmcNdYdguB4PgBGEMRDBGaPmwuGjopfeM5azhnE1z1WwdLyzui4Rv5KlMiggTJWRRew8uS9+ay6h6kcTxTACWHwnZWjRIKITYNRz0xI5-VyyFx1JchcOfGY98AJHaiX4M-e2VshFRSj-79KfzMcSulA8Dm29BfC4rxpQhXjqmPSfxwzaS5GNEI4IYhFBfu-Vmn9WLfwAhxJg3FeKYHXh1EMSkVKvDdrySaAQ0iXhFPkIcBE9KlDDHRXuZlj5oKwGxTB6FTZAOZG3YhOQ-gvGBJQz4PVrgu3ekrP4gJsgoLSsdbydkHJOQYK5ABV8m7MhvNUY8EQqgcl6tFF6Ph24K1iIrGiIMS6oIURVDmnR8GBSlHEX4Pg3aqVom7LSw0UymNTCpDS0o5E+0hpSU6OUYZww4I4i43IqZp1pqUJIIZATRGCRDJgfssq631obaJ3Dr4IH3kwZISsHyvGeM8Qxl4Xzj1CACP4T4WQ91miwj+6p3R4AgDErIU8mAvlyO47kJQ3FhDIvEAo4Ik7hBtqyMI6SNY9IQNgfIvVbYikKFUGInJKaXjbKY8ID4Qw0TemkvOQA */
  createMachine(
    {
      tsTypes: {} as import("./unknown-device.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
      id: "auth-unknown-device",
      initial: "Start",
      states: {
        Start: {
          initial: "CheckCapability",
          states: {
            CheckCapability: {
              invoke: {
                src: "isMobileWithWebAuthn",
                id: "isMobileWithWebAuthn",
                onDone: [
                  {
                    target: "#auth-unknown-device.RegistrationMachine",
                    cond: "bool",
                  },
                  {
                    target: "#auth-unknown-device.AuthSelection",
                  },
                ],
              },
            },
          },
        },
        RegistrationMachine: {
          invoke: {
            src: "RegistrationMachine",
            id: "registration",
            onDone: [
              {
                target: "End",
              },
            ],
            data: (context, event) => ({
              appMeta: context.appMeta,
            }),
          },
        },
        AuthSelection: {
          on: {
            AUTH_WITH_GOOGLE: {
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
          initial: "Fetch",
          states: {
            SignIn: {
              invoke: {
                src: "signInWithGoogle",
                id: "signInWithGoogle",
                onDone: [
                  {
                    target: "#auth-unknown-device.End",
                  },
                ],
              },
            },
            Fetch: {
              invoke: {
                src: "fetchGoogleDevice",
                id: "fetchGoogleDevice",
                onDone: [
                  {
                    cond: "isExistingGoogleAccount",
                    target: "SignIn",
                  },
                  {
                    target: "#auth-unknown-device.RegistrationMachine",
                  },
                ],
              },
            },
          },
        },
        RemoteAuthentication: {
          invoke: {
            src: "RemoteReceiverMachine",
            id: "remote",
            onDone: "TrustDevice",
            data: (context, event) => ({
              secret: uuid(),
              authRequest: context.authRequest,
              appMeta: context.appMeta,
            }),
          },
        },
        ExistingAnchor: {
          on: {
            END: {
              target: "End",
            },
            AUTH_WITH_OTHER: {
              target: "AuthSelection",
            },
          },
        },
        TrustDevice: {
          invoke: {
            src: "TrustDeviceMachine",
            id: "trustDeviceMachine",
            onDone: "End",
          },
        },
        End: {
          type: "final",
          data: (context, event: { data: AuthSession }) => event.data,
        },
      },
    },
    {
      guards: {
        isExistingGoogleAccount,
        bool: (context, event) => event.data,
      },
      services: {
        fetchGoogleDevice,
        signInWithGoogle,
        isMobileWithWebAuthn,
        RegistrationMachine,
        RemoteReceiverMachine,
        TrustDeviceMachine,
      },
    },
  )

export type UnknownDeviceActor = ActorRefFrom<typeof UnknownDeviceMachine>
export default UnknownDeviceMachine
