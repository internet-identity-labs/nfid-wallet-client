import { ethereumAsset, loadProfileFromLocalStorage } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"

import { getEthAddress } from "./get-eth-address"

export const getAllEthNFTs = async () => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const address = await getEthAddress(profile?.anchor)

  const { items } = await ethereumAsset.getItemsByUser({ address })

  return items
}
