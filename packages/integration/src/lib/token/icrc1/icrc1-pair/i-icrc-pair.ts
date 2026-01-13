import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { ICRC1Data, AllowanceDetailDTO } from "../types"

export interface IIcrc1Pair {
  validateStandard(): Promise<void>

  validateIfExists(rootPrincipalId: string): Promise<void>

  validateIndexCanister(): Promise<void>

  getICRC1Data(publicKey: string): Promise<ICRC1Data>

  storeSelf(): Promise<void>

  getBalance(principal: string): Promise<bigint>

  getIcrc2Allowances(
    rootPrincipalId: Principal,
  ): Promise<Array<AllowanceDetailDTO>>

  setAllowance(
    signIdentity: SignIdentity,
    spenderPrincipalId: Principal,
    amount: bigint,
  ): Promise<bigint>

  getMetadata(): Promise<{
    name: string
    symbol: string
    logo?: string
    decimals: number
    fee: bigint
  }>
}
