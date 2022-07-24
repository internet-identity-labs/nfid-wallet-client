import { ActorRefFrom, createMachine } from "xstate"

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

export type Events = { type: "TRUST" } | { type: "DONT_TRUST" }

export const TrustDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWnQJ1VnWwjADcBLAYzADoBlMAGzCvQGIAVAJQFV7OiUAAcA9rAroKogHZCQAD0QBGAOwAWWgE4ADAGZl6vVuUA2UwCY9pgDQgAnoguqAHLXUBWSx5cudprS0jUwBfELs0LFwCIhJyajpGFjZ2ABEAeQA5TgB9Hn5BJBAxCSlZeSUENU1dAyMTcytbB0RPN1rDC1MjD3UrVTCIjBx8QmJSShpaAElYAFlRACMKFgB1MEWAQWGZdnkSyWk5Isrei1pVfWVrVS6NLztHBAs1dy0PPStlfpcNdUGQJERjFxvEptwwFAKEQwHhVpJMOstjt2BBZHQKDIyKIANZ0PCQ6HoWHwrBI7ZYY4icSHconFTKLSmWg6HRaPS+VRaCzqVTXR5OVzuLwWHx+AJBf7hQHDaJjOKTOgQqEwuEIxhUVB4ST2ADSYHsqPRtEx2LxtAJUFKJPVrC1Ov1T2ppSOFQZTJZbI5v25vP5LSqek06l0lhefmcpg8AwBMlEpHgRSBctiEwSDGYrHQ+xpZSpilaFgFzz8tFMyjZllMOmUfgMAOTo1TYLoswWyzWGwpmHzBzzboQn3O0Y8rPU3xcfR0qmLznO6k8QZ0fVF1iZDdlTdBitoAFEZBAcy66aBKoZurQ1C5lBWQx4LGzZ7d3IuXrzXKp7zGhlEtwr08qRI2mSXY7EetL5pUXLMjWoqGB4FZsves5BtoHjsgElxfOoLihNKjYgv+4KEqqpKYBq9roHqBrgf29IINBLLfAhniIe8RYBro2jsqolxMiGD5GBuv6EWmNC0a69G1sWtaeqy8kKfJMZhEAA */
  createMachine(
    {
      tsTypes: {} as import("./trust-device.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "TrustDeviceMachine",
      initial: "Select",
      states: {
        Select: {
          on: {
            TRUST: {
              target: "IsMobileWebAuthn",
            },
            DONT_TRUST: {
              target: "End",
            },
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
            onDone: [
              {
                target: "End",
              },
            ],
          },
        },
        RegisterWithSecurityKey: {
          invoke: {
            src: "registerWithSecurityKey",
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
    {},
  )

export type TrustDeviceActor = ActorRefFrom<typeof TrustDeviceMachine>

export default TrustDeviceMachine
