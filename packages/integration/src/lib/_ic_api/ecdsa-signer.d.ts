import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface Conf {
  key: string
  price: bigint
}
export interface PublicKeyReply {
  public_key: Array<number>
}

export interface KeyPair {
  public_key: string
  private_key_encrypted: string
}
export interface KeyPairResponse {
  key_pair: [] | [KeyPair]
  princ: string
}
export type Result = { Ok: PublicKeyReply } | { Err: string }
export type Result_1 = { Ok: SignatureReply } | { Err: string }
export interface SignatureReply {
  signature: Array<number>
}
export interface _SERVICE {
  add_kp: ActorMethod<[KeyPair], undefined>
  get_kp: ActorMethod<[], KeyPairResponse>
  get_public_key: ActorMethod<[string], [] | [string]>
  public_key: ActorMethod<[], Result>
  sign: ActorMethod<[Array<number>], Result_1>
  prepare_signature: ActorMethod<[Array<number>], string>
  get_signature: ActorMethod<[string], Result_1>
}
