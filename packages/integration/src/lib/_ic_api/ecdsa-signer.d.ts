import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface Conf {
  key: string
  price: bigint
}
export interface PublicKeyReply {
  public_key: Array<number>
}
export type Result = { Ok: PublicKeyReply } | { Err: string }
export type Result_1 = { Ok: SignatureReply } | { Err: string }
export interface SignatureReply {
  signature: Array<number>
}
export interface _SERVICE {
  public_key: ActorMethod<[], Result>
  sign: ActorMethod<[Array<number>], Result_1>
  prepare_signature: ActorMethod<[Array<number>], string>
  get_signature: ActorMethod<[string], Result_1>
}
