import { ICRC1Data, ICRC1Metadata } from "../types"

export interface IIcrc1Pair {
  validateStandard(): Promise<void>

  validateIfExists(): Promise<void>

  validateIndexCanister(): Promise<void>

  getICRC1Data(publicKey: string): Promise<ICRC1Data>

  storeSelf(): Promise<void>

  getBalance(principal: string): Promise<bigint>

  getMetadata(): Promise<ICRC1Metadata>
}
