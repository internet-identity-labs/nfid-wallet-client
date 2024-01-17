import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { transfer } from "../icp"
import { makeDip20Actor } from "./actor"

type SwapFromICPParams = {
  sourceIdentity: SignIdentity
  tokenAccountId: string
  canisterId: string
  principalId: string
  amount: number
  memo?: bigint
}
export async function swapFromICP({
  sourceIdentity,
  tokenAccountId,
  canisterId,
  principalId,
  amount,
  memo,
}: SwapFromICPParams) {
  console.debug("swapFromICP", { canisterId, principalId, amount })
  const result = await transfer({
    amount,
    to: tokenAccountId,
    identity: sourceIdentity,
    memo,
  })
  const dip20Actor = makeDip20Actor(canisterId, sourceIdentity)
  return await dip20Actor
    .mint(Principal.fromText(principalId), result)
    .catch((e) => {
      throw Error(`swapFromICP failed: ${e}`)
    })
}
