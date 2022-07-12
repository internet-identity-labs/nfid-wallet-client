import { DelegationIdentity } from "@dfinity/identity"
import { ActorRefFrom, createMachine } from "xstate"

interface Context {
  signIdentity?: DelegationIdentity
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
      data: (context) => {
        if (!context.signIdentity) throw new Error("No sign identity")
        return context.signIdentity
      },
    },
  },
})

export type RegistrationActor = ActorRefFrom<typeof RegistrationMachine>

export default RegistrationMachine
