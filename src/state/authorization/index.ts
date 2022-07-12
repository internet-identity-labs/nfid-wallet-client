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

const AuthorizationMachine = createMachine({
  tsTypes: {} as import("./index.typegen").Typegen0,
  schema: { events: {}, context: {} } as Schema,
  id: "authorize",
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

export type AuthorizationActor = ActorRefFrom<typeof AuthorizationMachine>

export default AuthorizationMachine
