import { Principal } from "@dfinity/principal"

import { makeDip20Actor } from "./actor"

interface GetBalanceParams {
  canisterId: string
  principalId: string
}

export const getDIP20Balance = async ({
  canisterId,
  principalId,
}: GetBalanceParams) => {
  const dip20 = makeDip20Actor(canisterId)
  return dip20.balanceOf(Principal.fromText(principalId)).catch((e) => {
    throw new Error(`getBalance: ${e.message}`)
  })
}
