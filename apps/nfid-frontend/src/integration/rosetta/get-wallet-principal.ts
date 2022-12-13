import { Principal } from "@dfinity/principal"

import { ii } from "@nfid/integration"

import { WALLET_SCOPE } from "./index"

export async function getWalletPrincipal(anchor: number): Promise<Principal> {
  return ii.get_principal(BigInt(anchor), WALLET_SCOPE).catch((e) => {
    throw Error(`Getting of Wallet Principal failed!: ${e}`, e)
  })
}
