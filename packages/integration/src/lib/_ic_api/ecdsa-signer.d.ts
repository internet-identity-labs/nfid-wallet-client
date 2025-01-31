import type { ActorMethod } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import type { Principal } from "@dfinity/principal"

export interface CertifiedKeyPairResponse {
  certificate: Uint8Array | number[]
  witness: Uint8Array | number[]
  response: KeyPairResponse
}
export interface KeyPair {
  public_key: string
  private_key_encrypted: string
}
export interface KeyPairResponse {
  key_pair: [] | [KeyPair]
  princ: string
}
export interface _SERVICE {
  add_kp: ActorMethod<[KeyPair], undefined>
  get_kp: ActorMethod<[], KeyPairResponse>
  get_kp_certified: ActorMethod<[string], CertifiedKeyPairResponse>
  get_principal: ActorMethod<[[] | [string]], [string, [] | [string]]>
  get_public_key: ActorMethod<[string], [] | [string]>
  get_trusted_origins: ActorMethod<[], Array<string>>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]
