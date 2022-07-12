import { DelegationIdentity } from "@dfinity/identity"
import { assign, createMachine } from "xstate"

import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"

export interface Context {
  signIdentity?: DelegationIdentity
  googleIdentityExists?: boolean
}

export type Events =
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

export interface Schema {
  events: Events
  context: Context
}

function isMobileWithWebAuthn() {
  // Integration layer note: run async capability check initially and capture to memory.
  // Maybe make this an invokation to deal with async, while Philipp is sleeping.
  return false
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3QGJFQAHYrFrpaxPHxAAPRAEYATAE4AbEwDMAVlkbl8jQBoQAT0Ty1ABgC+lw2iy5CJcpRoNmAJTBRasdB2Si4gCyyPSYtHhg3BDizBHUxATMHF4+fgFiEkgggsKBWaAyCLKKGuZMACzK5opqAOwGxqZ1skwa1rYYOPhEZBRUdIxMAIJdLGAANmD0+dzDAKoAKgASAPoA6gCSK6sA4gDy+7sAMgCikrkimZJFZgAclfWNJggVGvIdIHbdjn0ug8xRlhxlMZpk5ks1lsdu5TkF9otztlLvkbqY1A8Kk9DC9lHcNEw7mpiSTSWoKp9vg5es4Bm4RmNJtNZgsdtC1gjlqd3BchFdxGiEPdHg0cXJZOV2jYvl1qU5+q4hkDMOsRJhdsRiFAprxkXzUdkihKLExzPjaqKmq8JW1KbKevL-vTPABbYjoMDKsB4UT0DLiaKxJjxRLJMBuj28vLXQ2IO7yeRMeTmNQKZ6IZSZ9RknMU6VUh1-OlDTzeXxgDgAEUVYGr9FoVA43Er+wAcotVot3PMWB3K6cAGqbADCSIE+pjhTkSlUmm0unTCA0ilkdvshdpNaYpbSFerALrDYr3C7Pb7g5HY5yE4FseKM-UWh0ejFCGUijznXXv03AO3qXLKsa0DSJgzwBIkiYAsfwVP8d0A-c3AQEM-XyABtcwAF0o35AppDkUpyiqGpsStOoKg+fN7Rgp0SwAj0gIBbgKw4YgOCYfgJgCAAzNiXSg6iaVg516L3GtkPA4hUMyDDsL1aNbynYoMUlNRFHMBdX3Iyivx+ITaI8UTGLcU4OFYptT17VZ+yHUccINJSFBUR95xfK07gqT8ZW-fTi0MssGMQxhTPM7hTlbSt7MnfD72cudn0XO5FB07y9MdPymFOKQ0giKBhjwMI2O4TZW12U4rJYTZdlbVZNn7dttgATSixSYruWQ6iTFM01fFdrGlEgqHgbJoN8rc2E4dAWrwo1tEUdQFAqZL6g08wNEXeR8TXNKiy3U48AgabBXkDq1CYZLZDuS0Xg0dqmFkCj8RaR6NBaba5V2uD6P8fIQjCCIwCOu9tDucpFAuq6NuXW0qJ89Kt2VEFmWilFoqKCjX0zTrbpzUkvNG+G-2VVUsA1LUpiBpT40TZNUzcl4qgJKVdI+38RIjT0um9X1-Tw1HWvRzy2jpxdlA0Cps1xkl8cEwmRICsSD2mI8OEpmLjQJM1l1I3E6nmokpeJGW4c++Xd2Mxg1aNZQFEJBN5DFzSyJtZnUtZ4S6IVi2wBCtirbkNaCU8jQRdfK7E1dgnTaGLKcrwPKCswP35NwwUQ8Tcwqkh18JQlyPZejwGU4c9W7hzu5+ssIA */
  createMachine(
    {
      tsTypes: {} as import("./unknown-device.typegen").Typegen0,
      schema: { events: {}, context: {} } as Schema,
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
