import { ActorRefFrom, assign, createMachine, send } from "xstate"

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

import RegistrationMachine from "./registration"
import RemoteReceiverMachine from "./remote-receiver"

export interface Context {}

export type Events =
  | { type: "done.invoke.remote"; data: RemoteDeviceAuthSession }
  | { type: "done.invoke.registration"; data: AuthSession }
  | { type: "done.invoke.registerDevice"; data: AuthSession }
  | { type: "done.invoke.fetchGoogleDevice"; data: GoogleDeviceResult }
  | { type: "done.invoke.signInWithGoogle"; data: GoogleAuthSession }
  | { type: "AUTH_WITH_GOOGLE"; data: string }
  | { type: "AUTH_WITH_REMOTE" }
  | { type: "AUTH_WITH_OTHER" }
  | { type: "END"; data: AuthSession }

export interface Schema {
  events: Events
  context: Context
}

const UnknownDeviceMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWlQOwGs8B7Adz2wjADcBLAYzADoBldZAJ3QGJFQAHYrFrpaxPHxAAPRAEYAbABYmABgDMAThUAOAEzbFAVhWHdsgDQgAnoi1MNDx9tna1igOzv5AX2+W0WLiEJOSUNAzMAEpgULSw6BzIouIAssj0mLR4YNwQ4sxZ1MQEzBwxcQlJYhJIIILCyTWgMgjO2kyyigZuhhpqhkqWNgiyhrL2Ts4auvLq8u6+-hg4+ERkFFR0jEwAgsssYAA2YPSN3DsAqgAqABIA+gDqAJK3dwDiAPIfbwAyAKKSeoiaqSFq6RRqJgQ9yKDSKFzuWS6dwabRDRCaeRMVxqNTOXT6DReBZ+EABFbBdZhLbMPZYA7HU7Vc7Xe7PV6RP4pD5XAG1IGNUGIXS4qFqGFwhFIlFo6yIeSGZS43FKMbyDTqklLQKrEIbcLbOmYBknM6XV7s+48m5-SKAoTA8RChC6QyQ6Gw+HaRHI1HohBqFQaVQqUOKeERjXaHyk8lBNahTYRXbLB4iTBvYjEKDHVi0KB4J54XL5JiFYrMYQFotprCZ7PHe0NEG1FoKFTuJjyNT6dTubQqdW6f0eSE48X6dy6Ik9xZk5bxvXU5NG2sZrM55gAMTA6AyJeyZbwRRKTAAZruMvXNwARA1gJuOprSRDe4NupFjIw9lwjpHY5V3EVBRZBUDw5zjXUqSTbZogAW2IdAwCNMA8FEegqnEA8CmPCsmDKBCkMfQVW1fHR7EHGYRVMfo1AsOUEAVJVlVVBQNSJCCFygxN7yYaJYniMAODvGlsKPE9mEgykeJpPjykE4T7wQcsMMaABtFQAF1iJbZpECnFQmGMTwHEUMx1FlYZPGYlUjDYzVOJ1aT9Vk-iKiEkSIm4ISOGIDgmH4Q4kjPPy4KYKSExc5M3IUzzGGU3DVOqDTtP5B0SL0l09Ao+RwSRAch3Uf0gMMCYHEMbRTGRNQY21ClIuXWD5KQxSaT+DhfI4bgrkiC4WCuO4bz+AA1J4AGE+QEdLdJfLLdByvLe0KtR-QHZRQ1DaYzDfGZHPqpcYKiZqPPvdrOu4P4ADkbx0p1SJdKcFvhJbpiKhjphsmq7PVBzYy45zGuYP4pAqLIoB2PAMj8i7rtu58Wm7TtwTMPo6MnMx-WRQzx3cFROjaOE9sXaDeOB0G8HByHMGh802ReK1bltOHnVdd1xU9KVfUs4V5HGDa+1mXQ8Yq3xSRIKh4FqCKDt4thOHQZn7rM-1Oixfm3HVQxDBlInuKipqBMqRo0gyLIHzS5s7sy8N2nmdiPHkWYtBMFWhaMjapTx5wUV1gHDpTekjlNGaBRmlplYYmZ2iF0NNCcV0td9hr-dXdNr1zFh80LZ9Q6t2bZFkGF7HFUx1CMEwCRHMymGVGrcdmUCkSTmXZNTusN1zHc90wRXrZRIy0Zq6ZQPFPoR0DGuWK6AdkXhNRm5J1vUzTjvzamy34cQIxSo-EUhxHlEVoY3Fgxx0CBnLrV5yc5PePgxDkOWVD0MwnPprz8OaqYEVoW1mZZm0Bqf0uV5rjgqrjRQQZPALxktFY6rUIi91ml0SE-Q+iKiYnCbmCAYSgOVOAsCUCr7S0XnAw2J02odT8kg8Ow4GJeD5h7MYqIRSuBgfrIGIN4hgwhlDDgNCt7hi7MLJig4ITyExkoACuIgImUgRoUY7DAZMD+HgCAAiRiVVKrjOiuV+w1XkAYEciIuxaFhOCfseiNBKMOho38DEXAhn5s4jaJJfBAA */
  createMachine(
    {
      context: {},
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
        RegistrationMachine: {
          invoke: {
            src: "RegistrationMachine",
            id: "registration",
            onDone: "End",
          },
        },
        AuthSelection: {
          on: {
            AUTH_WITH_GOOGLE: "AuthWithGoogle",
            AUTH_WITH_REMOTE: "RemoteAuthentication",
            AUTH_WITH_OTHER: "ExistingAnchor",
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
            onDone: "End",
          },
        },
        RegisterDevice: {
          invoke: {
            src: "registerDevice",
            onDone: "End",
            onError: "RegisterDeviceError",
          },
        },
        RegisterDeviceError: {
          on: {
            TRUST_DEVICE: "RegisterDevice",
            END: "End",
          },
        },
        ExistingAnchor: {
          on: {
            END: "End",
            AUTH_WITH_OTHER: "AuthSelection",
          },
        },
        End: {
          type: "final",
          // @ts-ignore: xstate typegen isn't identifying that AUTH_WITH_REMOTE will never lead to final state
          data: (context, event) => event.data,
        },
      },
    },
    {
      guards: {
        isMobileWithWebAuthn,
        isExistingGoogleAccount,
      },
      services: {
        RegistrationMachine,
        RemoteReceiverMachine,
        fetchGoogleDevice,
        signInWithGoogle,
        // registerDevice,
      },
    },
  )

export type UnknownDeviceActor = ActorRefFrom<typeof UnknownDeviceMachine>
export default UnknownDeviceMachine
