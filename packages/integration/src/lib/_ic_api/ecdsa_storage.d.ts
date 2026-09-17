import type { ActorMethod } from "@icp-sdk/core/agent"
import type { Principal } from "@icp-sdk/core/principal"

export interface CertifiedRoot {
  root: string
  certificate: Uint8Array | number[]
  witness: Uint8Array | number[]
}
export interface AnonymousDelegationRequest {
  certified_root: CertifiedRoot
  domain: string
  session_key: Uint8Array | number[]
  targets: Array<Principal>
  delegation_ttl_ms: [] | [bigint]
}
export interface GlobalDelegationRequest {
  certified_root: CertifiedRoot
  session_key: Uint8Array | number[]
  targets: Array<Principal>
  delegation_ttl_ms: [] | [bigint]
}
export interface AnonymousPrincipalRequest {
  certified_root: CertifiedRoot
  domain: string
}
export interface Delegation {
  pubkey: Uint8Array | number[]
  expiration: bigint
  targets: [] | [Array<Principal>]
}
export interface SignedDelegation {
  delegation: Delegation
  signature: Uint8Array | number[]
}
export interface DelegationChain {
  delegations: Array<SignedDelegation>
  public_key: Uint8Array | number[]
}
export type DelegationResult = { Ok: DelegationChain } | { Err: string }
export interface SealedSalts {
  ephemeral_public_key: string
  nonce: string
  ciphertext: string
}
export interface ImportedKeyPair {
  root: string
  public_key: string
  private_key_encrypted: string
}
export interface Status {
  im_canister: [] | [Principal]
  custom_ic_root_key: boolean
  salts_provisioned: boolean
  salts_fingerprint: [] | [string]
  provisioning_key_pending: boolean
  global_keys: bigint
}
export interface InitArgs {
  im_canister: Principal
  ic_root_key: [] | [Uint8Array | number[]]
}
export interface _SERVICE {
  get_anonymous_delegation: ActorMethod<
    [AnonymousDelegationRequest],
    DelegationResult
  >
  get_global_delegation: ActorMethod<
    [GlobalDelegationRequest],
    DelegationResult
  >
  get_anonymous_principal: ActorMethod<
    [AnonymousPrincipalRequest],
    { Ok: Principal } | { Err: string }
  >
  get_provisioning_key: ActorMethod<[], { Ok: string } | { Err: string }>
  provision_salts: ActorMethod<[SealedSalts], { Ok: null } | { Err: string }>
  import_global_keys: ActorMethod<
    [Array<ImportedKeyPair>],
    { Ok: bigint } | { Err: string }
  >
  status: ActorMethod<[], { Ok: Status } | { Err: string }>
}
