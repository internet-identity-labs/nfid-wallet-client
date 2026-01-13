import { SignIdentity } from "@dfinity/agent"
import {
  AccountIdentifier,
  checkAccountId,
  SubAccount,
} from "@dfinity/ledger-icp"
import { decodeIcrcAccount } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"

import { BlockIndex, Memo, TransferResult } from "../../_ic_api/ledger.d"
import { ledgerWithIdentity } from "../../actors"

//todo not properly tested. blocked by e2e

type TransferParams = {
  amount: number
  to: string
  memo?: Memo
  identity: SignIdentity
}

const addressValidationService = {
  isValidAccountIdentifier(value: string): boolean {
    try {
      checkAccountId(value)
      return true
    } catch {
      return false
    }
  },
  isValidPrincipalId(value: string): boolean {
    try {
      if (Principal.fromText(value)) return true
      return false
    } catch {
      return false
    }
  },
}

export const getAccountIdentifier = (address: string): string => {
  if (addressValidationService.isValidAccountIdentifier(address)) return address

  try {
    // Try if it's default principal or `${principal}-${checksum}-${subaccount}`
    const principal = Principal.fromText(address)
    const accountIdentifier = AccountIdentifier.fromPrincipal({ principal })
    return accountIdentifier.toHex()
  } catch (_e) {
    // Handle `${principal}-${checksum}-${subaccount}`
    const { owner: principalTo, subaccount } = decodeIcrcAccount(address)
    const subAccountObject = subaccount
      ? SubAccount.fromBytes(subaccount as Uint8Array)
      : null
    if (subAccountObject instanceof Error) throw subAccountObject

    return AccountIdentifier.fromPrincipal({
      principal: principalTo,
      subAccount: subAccountObject ?? undefined,
    }).toHex()
  }
}

export async function transfer({
  amount,
  to,
  memo = BigInt(0),
  identity,
}: TransferParams): Promise<BlockIndex> {
  const ledgerWithWallet = ledgerWithIdentity(identity)

  const result: TransferResult = await ledgerWithWallet
    .transfer({
      to: fromHexString(to),
      amount: { e8s: BigInt(amount.toFixed()) },
      memo,
      fee: { e8s: BigInt(10000) },
      from_subaccount: [],
      created_at_time: [],
    })
    .catch((e: any) => {
      throw Error(`Transfer failed!: ${e}`)
    })

  if ("Err" in result) throw Error(Object.keys(result.Err)[0])
  return result.Ok
}

export function fromHexString(hex: string): number[] {
  if (hex.length % 2 !== 0) {
    throw "Must have an even number of hex digits to convert to bytes"
  }
  const numBytes = hex.length / 2
  const byteArray = new Uint8Array(numBytes)
  for (let i = 0; i < numBytes; i++) {
    byteArray[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return Array.from(byteArray)
}
