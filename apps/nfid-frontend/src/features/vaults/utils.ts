import { Principal } from "@dfinity/principal"

import { getVaults, getWallets } from "@nfid/integration"
import { getAddress } from "frontend/util/get-address"

export const getVaultWalletByAddress = async (walletAddress: string) => {
  const vaults = await getVaults()
  const allWallets = (
    await Promise.all(vaults.map(async (vault) => await getWallets(vault.id)))
  ).flat()

  const mappedWallets = allWallets.map((w) => ({
    ...w,
    address: getAddress(Principal.fromText(VAULT_CANISTER_ID), w.uid),
  }))

  return mappedWallets.find((w) => w.address === walletAddress)
}
