import type { ActorMethod } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface Metadata {
  fee: bigint
  decimals: number
  owner: Principal
  logo: string
  name: string
  totalSupply: bigint
  symbol: string
}
export type Result = { Ok: bigint } | { Err: TxError }
export interface TokenInfo {
  holderNumber: bigint
  deployTime: bigint
  metadata: Metadata
  historySize: bigint
  cycles: bigint
  feeTo: Principal
}
export type TxError =
  | { InsufficientAllowance: null }
  | { InsufficientBalance: null }
  | { ErrorOperationStyle: null }
  | { Unauthorized: null }
  | { LedgerTrap: null }
  | { ErrorTo: null }
  | { Other: string }
  | { BlockUsed: null }
  | { AmountTooSmall: null }
export interface _SERVICE {
  allowance: ActorMethod<[Principal, Principal], bigint>
  approve: ActorMethod<[Principal, bigint], Result>
  balanceOf: ActorMethod<[Principal], bigint>
  burn: ActorMethod<[bigint], Result>
  decimals: ActorMethod<[], number>
  getAllowanceSize: ActorMethod<[], bigint>
  getHolders: ActorMethod<[bigint, bigint], Array<[Principal, bigint]>>
  getMetadata: ActorMethod<[], Metadata>
  getTokenInfo: ActorMethod<[], TokenInfo>
  getUserApprovals: ActorMethod<[Principal], Array<[Principal, bigint]>>
  historySize: ActorMethod<[], bigint>
  logo: ActorMethod<[], string>
  mint: ActorMethod<[Principal, bigint], Result>
  name: ActorMethod<[], string>
  owner: ActorMethod<[], Principal>
  setFee: ActorMethod<[bigint], undefined>
  setFeeTo: ActorMethod<[Principal], undefined>
  setLogo: ActorMethod<[string], undefined>
  setName: ActorMethod<[string], undefined>
  setOwner: ActorMethod<[Principal], undefined>
  symbol: ActorMethod<[], string>
  totalSupply: ActorMethod<[], bigint>
  transfer: ActorMethod<[Principal, bigint], Result>
  transferFrom: ActorMethod<[Principal, Principal, bigint], Result>
}
