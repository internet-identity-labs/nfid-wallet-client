import { ActorRefFrom, createMachine } from "xstate"

import { AuthSession } from "frontend/state/authorization"

export interface Context {
  user?: AuthSession
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
    Start: {
      entry: () => console.log("ENTRY!"),
    },
    End: {
      type: "final",
      data: (context) => context,
    },
  },
})

export type KnownDeviceActor = ActorRefFrom<typeof KnownDeviceMachine>

export default KnownDeviceMachine
