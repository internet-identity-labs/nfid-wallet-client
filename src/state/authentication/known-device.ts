import { DelegationIdentity } from "@dfinity/identity"
import { ActorRefFrom, createMachine } from "xstate"

export interface Context {
  signIdentity?: DelegationIdentity
}

export type Events = { type: "X" }

export interface Schema {
  events: Events
  context: Context
}

const KnownDeviceMachine = createMachine({
  tsTypes: {} as import("./known-device.typegen").Typegen0,
  schema: { events: {}, context: {} } as Schema,
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

export type KnownDeviceActor = ActorRefFrom<typeof KnownDeviceMachine>

export default KnownDeviceMachine
