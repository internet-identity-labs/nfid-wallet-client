import { Principal } from "@dfinity/principal"
import { fromHexString, principalToAddress } from "ictool"

import { getVaults, getWallets } from "@nfid/integration"

export const getVaultWalletByAddress = async (walletAddress: string) => {
  const vaults = await getVaults()
  const allWallets = (
    await Promise.all(vaults.map(async (vault) => await getWallets(vault.id)))
  ).flat()

  const mappedWallets = allWallets.map((w) => ({
    ...w,
    address: principalToAddress(
      Principal.fromText(VAULT_CANISTER_ID),
      fromHexString(w.uid),
    ),
  }))

  return mappedWallets.find((w) => w.address === walletAddress)
}
