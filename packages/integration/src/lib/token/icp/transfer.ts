import { SignIdentity } from "@dfinity/agent"

import { BlockIndex, Memo, TransferResult } from "../../_ic_api/ledger.d"
import { ledgerWithIdentity } from "../../actors"

//todo not properly tested. blocked by e2e

type TransferParams = {
  amount: number
  to: string
  memo?: Memo
  identity: SignIdentity
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
  var numBytes = hex.length / 2
  var byteArray = new Uint8Array(numBytes)
  for (var i = 0; i < numBytes; i++) {
    byteArray[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return Array.from(byteArray)
}
