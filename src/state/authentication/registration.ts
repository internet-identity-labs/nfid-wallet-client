import { ActorRefFrom, createMachine } from "xstate"

import { AuthSession } from "frontend/state/authorization"

interface Context {
  user?: AuthSession
}

type Events = { type: "X" }

const RegistrationMachine = createMachine({
  tsTypes: {} as import("./registration.typegen").Typegen0,
  schema: { events: {} as Events, context: {} as Context },
  id: "auth-registration",
  initial: "Start",
  states: {
    Start: {},
    End: {
      type: "final",
      data: (context) => context,
    },
  },
})

export type RegistrationActor = ActorRefFrom<typeof RegistrationMachine>

export default RegistrationMachine
