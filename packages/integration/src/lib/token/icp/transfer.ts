import { SignIdentity } from "@dfinity/agent"
import { fromHexString } from "ictool"

import { BlockIndex, TransferResult } from "../../_ic_api/ledger.d"
import { ledgerWithIdentity } from "../../actors"

//todo not properly tested. blocked by e2e

export async function transfer(
  amount: number,
  to: string,
  identity: SignIdentity,
): Promise<BlockIndex> {
  const ledgerWithWallet = ledgerWithIdentity(identity)

  const result: TransferResult = await ledgerWithWallet
    .transfer({
      to: fromHexString(to),
      amount: { e8s: BigInt(amount.toFixed()) },
      memo: BigInt(0),
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
