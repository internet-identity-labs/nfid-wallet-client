import { DelegationIdentity } from "@dfinity/identity"
import { createMachine } from "xstate"

interface Context {
  signIdentity?: DelegationIdentity
}

interface Services {}

type Events = {
  type: "done.invoke.authentivate-known-device"
  data: DelegationIdentity
}

const services: Services = {}

const RegistrationMachine = createMachine({
  tsTypes: {} as import("./registration.typegen").Typegen0,
  schema: { events: {} as Events, context: {} as Context },
  id: "authenticate-known-device",
  initial: "Start",
  states: {
    Start: {},
    End: {
      type: "final",
      data: (context, event) => {
        if (!context.signIdentity) throw new Error("No sign identity")
        return context.signIdentity
      },
    },
  },
})

export default RegistrationMachine
