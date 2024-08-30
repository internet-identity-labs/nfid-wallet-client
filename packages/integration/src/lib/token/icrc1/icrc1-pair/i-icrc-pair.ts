import { ICRC1Data } from "../types"

export interface IIcrc1Pair {
  validateStandard(): Promise<void>

  validateIfExists(rootPrincipalId: string): Promise<void>

  validateIndexCanister(): Promise<void>

  getICRC1Data(publicKey: string): Promise<ICRC1Data>

  storeSelf(): Promise<void>

  getBalance(principal: string): Promise<bigint>

  getMetadata(): Promise<{
    name: string
    symbol: string
    logo?: string
    decimals: number
    fee: bigint
  }>
}
