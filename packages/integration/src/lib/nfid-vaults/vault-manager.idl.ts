import type { ActorMethod } from "@icp-sdk/core/agent"
import type { IDL } from "@icp-sdk/core/candid"
import type { Principal } from "@icp-sdk/core/principal"

export type VaultType = { Pro: null } | { Light: null }

export interface CreateResult {
  canister_id: Principal
}

export interface CreationPrice {
  price_e8s: bigint
  approve_e8s: bigint
  cost_e8s: bigint
  protocol_e8s: bigint
  initial_cycles_balance: bigint
  creation_fee_cycles: bigint
  total_cycles: bigint
  xdr_permyriad_per_icp: bigint
}

export type CreateCanisterResult = { Ok: CreateResult } | { Err: string }
export type CreationPriceResult = { Ok: CreationPrice } | { Err: string }

export interface VaultManagerService {
  create_canister_icrc2: ActorMethod<
    [[] | [VaultType], [] | [Principal]],
    CreateCanisterResult
  >
  get_creation_price: ActorMethod<[], CreationPriceResult>
}

export const vaultManagerIDL: IDL.InterfaceFactory = ({ IDL }) => {
  const VaultType = IDL.Variant({ Pro: IDL.Null, Light: IDL.Null })
  const CreateResult = IDL.Record({ canister_id: IDL.Principal })
  const Result = IDL.Variant({ Ok: CreateResult, Err: IDL.Text })
  const CreationPrice = IDL.Record({
    price_e8s: IDL.Nat64,
    approve_e8s: IDL.Nat64,
    cost_e8s: IDL.Nat64,
    protocol_e8s: IDL.Nat64,
    initial_cycles_balance: IDL.Nat,
    creation_fee_cycles: IDL.Nat,
    total_cycles: IDL.Nat,
    xdr_permyriad_per_icp: IDL.Nat64,
  })
  const CreationPriceResult = IDL.Variant({
    Ok: CreationPrice,
    Err: IDL.Text,
  })

  return IDL.Service({
    create_canister_icrc2: IDL.Func(
      [IDL.Opt(VaultType), IDL.Opt(IDL.Principal)],
      [Result],
      [],
    ),
    get_creation_price: IDL.Func([], [CreationPriceResult], []),
  })
}
