import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { makeDip20Actor } from "./actor"

type TransferArgs = {
  canisterId: string
  to: string
  amount: number
  sourceIdentity: SignIdentity
}

export async function transfer({
  canisterId,
  to,
  amount,
  sourceIdentity,
}: TransferArgs) {
  console.debug("transfer", { canisterId, to, amount })
  const dip20Actor = makeDip20Actor(canisterId, sourceIdentity)
  const response = await dip20Actor
    .transfer(Principal.fromText(to), BigInt(amount))
    .catch((e) => {
      throw Error(`transfer failed: ${e}`)
    })

  if ("Err" in response) throw Error(Object.keys(response.Err)[0])

  console.debug("transfer", { response })
  return response.Ok
}
