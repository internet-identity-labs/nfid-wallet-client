import { Principal } from "@dfinity/principal"

import { WALLET_SCOPE } from "@nfid/config"
import { ii } from "@nfid/integration"

export async function getWalletPrincipal(anchor: number): Promise<Principal> {
  return ii.get_principal(BigInt(anchor), WALLET_SCOPE).catch((e) => {
    throw Error(`Getting of Wallet Principal failed!: ${e}`, e)
  })
}
