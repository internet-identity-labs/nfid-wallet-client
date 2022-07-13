/**
 * UserActor is the global state authority on the user.
 * I don't see how a state machine is at all valuable for this type of data store.
 */
import { SignIdentity } from "@dfinity/agent"
import { DelegationIdentity } from "@dfinity/identity"
import { ActorRefFrom, createMachine } from "xstate"

interface Context {
  /** TODO: Comment what this is */
  signIdentity?: SignIdentity
  /** TODO: Comment what this is */
  delegationIdentity?: DelegationIdentity
  /** internet identity anchor */
  anchor?: string
  /** something about device because philipp */
  device?: {}
}

type Events = { type: "x" }

interface Schema {
  context: Context
  events: Events
}

const UserMachine = createMachine({
  context: {},
  schema: {} as Schema,
  tsTypes: {} as import("./user.typegen").Typegen0,
  states: {},
})

export type UserActor = ActorRefFrom<typeof UserMachine>
