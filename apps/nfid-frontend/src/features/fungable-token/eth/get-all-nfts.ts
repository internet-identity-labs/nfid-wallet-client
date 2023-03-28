import { ethereumAsset, loadProfileFromLocalStorage } from "@nfid/integration"

import { fetchProfile } from "frontend/integration/identity-manager"

import { getEthAddress } from "./get-eth-address"

const ROOT_DOMAIN = "nfid.one"
const ETH_ROOT_ACCOUNT = "account 1"

export const getAllEthNFTs = async () => {
  const profile = loadProfileFromLocalStorage() ?? (await fetchProfile())
  const address = await getEthAddress({
    anchor: profile.anchor,
    accountId: ETH_ROOT_ACCOUNT,
    hostname: ROOT_DOMAIN,
  })

  const { items } = await ethereumAsset.getItemsByUser({ address })

  return items
}
