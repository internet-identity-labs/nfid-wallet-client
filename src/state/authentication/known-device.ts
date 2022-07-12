import { DelegationIdentity } from "@dfinity/identity"
import { createMachine } from "xstate"

interface Context {
  signIdentity?: DelegationIdentity
}

type Events = { type: "X" }

const KnownDeviceMachine = createMachine({
  tsTypes: {} as import("./known-device.typegen").Typegen0,
  schema: { events: {} as Events, context: {} as Context },
  id: "auth-known-device",
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

export default KnownDeviceMachine
