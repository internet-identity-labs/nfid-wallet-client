import type { ActorMethod } from "@dfinity/agent"

export type Address = string
export type Secret = string
export type Signature = string
export interface _SERVICE {
  get_secret: ActorMethod<[Address, Signature], Secret>
  init: ActorMethod<[], undefined>
}
