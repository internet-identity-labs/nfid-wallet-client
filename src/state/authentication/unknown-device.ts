import { DelegationIdentity } from "@dfinity/identity"
import { assign, createMachine } from "xstate"

import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"

interface Context {
  signIdentity?: DelegationIdentity
  googleIdentityExists?: boolean
}

interface Services {}

type Events =
  | {
      type: "AUTH_WITH_GOOGLE"
      data: { identity: DelegationIdentity; isExisting: boolean }
    }
  | { type: "done.invoke.remote"; data: DelegationIdentity }
  | { type: "AUTH_WITH_REMOTE" }
  | { type: "AUTH_WITH_OTHER" }
  | { type: "TRUST_DEVICE" }
  | { type: "DONT_TRUST_DEVICE" }

function isMobileWithWebAuthn() {
  // Integration layer note: run async capability check initially and capture to memory.
  // Maybe make this an invokation to deal with async, while Philipp is sleeping.
  return true
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFmAduglgMbLpgC0qOA1jgPYDuOZEYAbkWAHQDK6yATugDEiUAAdasfAVo5RIAB6IATMoAcnACwBmAOyaAnEePHdAGhABPRAYCMAX3sW0WXAWKkK1Oo2ZsOnACCGJjcYAA2YIQyOEKBAKoAKgASAPoA6gCSKakA4gDy+bkAMgCi8hJSMfJKCKoaOvomzeZWKgBsDk4gLth4RCTklDQMTCzshFzBWGGR0fiycUlpWTkASqUAsvmJ5UggldILcvu19Vp6hs2mFtYImgAMBo7OIW4DnsM+Y-6TQSHpaSYXK0WhQSIifaHaqnRC2WwAVmUnFsulsal0CNucKRnARLx6b36HiG3lGfgmXDWYAAtrRSNM+u4SMchBBZFx8DhWLQqFx+LT6WAKpIjrIaog1AYEZxMdiENopXiCb13iSvCNfOMAtSoPhYKR+AARX5gE2EfAsfhCI35AByiVSiTW8W4jqNpQAapkAMJ7cSimGgWq2R7I2zKLFtBW6DS2B7tbSaWztB7KNEJlVE5mfMla02cXX6w0mylsjmcLk8vmcVXEwYa74UnVgPUGsDG00IKu0DzHADaDwAuiKqscJQhQw9tHiDHoo3d2mpNMrunWc6TNT9KYXW8WO6WOEIO-xaPxOGJwiQAGZnmm17MfTdN7V-IvtzuU7vc3ss2SDkcoUDcdYUneMHk4dMnnaXQ9HhNQEPlBEDBXCNYLnNRU2XTEs1cetcy3Zs3z3D9D0mUp+FPa1nVdd0vV9f0DmA8VQKlGU5WjNFUPaHjeL4njcKZJ9G3JV8qRIktTQoqihFKO0jVHMUTmDOFlAMdpOAwnRNB49N0yQxFZQeTR9GXPRpUMRxujoFh4H2ddhK+USC14AR0EUoNFDhBNOG0AwzKaa55VDdpBLVBsnPzHdShwCAPJAlTJ06AxNIMZR0Q4u5HgaB5cry-Lcu0ML8OfZyd3fdB+D-HBNmQQhMC5YUgLHFjEoRWwZweWMIwXVSIPxNdH3VSLtwCRlZiiTzoQSrz7mUeV1GRfjlpg4qNxEqKxoBIEQTBSJ4ta2bkJXNRct0dpkLsdKngW-RV1ePD1pGojxLpBkhuqg7lKOjrOC6tQevlPRdDxAqwczQbHscvNRuIttJMpc1LQ7L6J3hWwUrUZQeP8tQ9DggwgbRThU0TZNU3TeNQshoThphl7d3hg9TVR0D4QRBo0oy3qEAuoqafCgiXwLCrmcpaSz1ZxKDB8jHdH0Dr4W0bQkKeSDjNMxoLOeAWSo22GmoDFrvpDNRgo0ArKZ0acsYGxwgA */
  createMachine(
    {
      tsTypes: {} as import("./unknown-device.typegen").Typegen0,
      schema: { events: {} as Events, context: {} as Context },
      id: "authenticate-unknown-device",
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
            DONT_TRUST_DEVICE: "End",
            TRUST_DEVICE: "RegisterDevice",
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
