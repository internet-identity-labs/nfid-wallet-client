import type { ActorMethod } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import type { Principal } from "@icp-sdk/core/principal"

export interface InitArgs {
  im_canister: Principal
}
export interface PassKeyData {
  key: string
  data: string
}
export interface _SERVICE {
  get_passkey: ActorMethod<[Array<string>], Array<PassKeyData>>
  get_passkey_by_anchor: ActorMethod<[bigint], Array<PassKeyData>>
  remove_passkey: ActorMethod<[string, bigint], bigint>
  store_passkey: ActorMethod<[string, string, bigint], bigint>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]
