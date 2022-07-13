import { ActorRefFrom, createMachine } from "xstate"

import { User } from "../authorization/idp"

export interface Context extends User {}

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
      data: (context) => context,
    },
  },
})

export type KnownDeviceActor = ActorRefFrom<typeof KnownDeviceMachine>

export default KnownDeviceMachine
