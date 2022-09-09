// State machine controlling the phone number credential flow.
import { ActorRefFrom, assign, createMachine } from "xstate"

import { AuthSession } from "frontend/state/authentication"
import { AuthorizingAppMeta } from "frontend/state/authorization"

import AuthenticationMachine from "../authentication/authentication"
import TrustDeviceMachine from "../authentication/trust-device"

// State local to the machine.
interface Context {
  appMeta?: AuthorizingAppMeta
  authSession?: AuthSession
}

// Definition of events usable in the machine.
type Events = {
  type: "done.invoke.AuthenticationMachine"
  data: AuthSession
}

const NFIDAuthenticationMachine = createMachine(
  {
    context: {} as Context,
    tsTypes: {} as import("./authentication.typegen").Typegen0,
    schema: { events: {} as Events },
    id: "NFIDAuthenticationMachine",
    initial: "Authenticate",
    states: {
      Authenticate: {
        invoke: {
          src: "AuthenticationMachine",
          id: "AuthenticationMachine",
          onDone: [{ target: "TrustDevice", actions: "assignAuthSession" }],
          data: (context) => ({
            appMeta: context.appMeta,
          }),
        },
      },
      TrustDevice: {
        invoke: {
          src: "TrustDeviceMachine",
          id: "trustDeviceMachine",
          onDone: "End",
        },
      },
      End: {},
    },
  },
  {
    actions: {
      assignAuthSession: assign((_, event) => ({
        authSession: event.data,
      })),
    },
    services: {
      AuthenticationMachine,
      TrustDeviceMachine,
    },
    guards: {},
  },
)

export default NFIDAuthenticationMachine

export type NFIDAuthenticationActor = ActorRefFrom<
  typeof NFIDAuthenticationMachine
>
export type NFIDAuthenticationType = typeof NFIDAuthenticationMachine
