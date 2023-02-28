import { ethereumAsset } from "@nfid/integration"

import { getAllEthAddresses } from "./get-all-addresses"

export const getAllEthNFTs = async () => {
  const addresses = await getAllEthAddresses()

  const nfts = await Promise.all(
    addresses.map(async (address) => {
      const items = (await ethereumAsset.getItemsByUser({ address: address }))
        .items

      const result = items.map((item) => ({ ...item, owner: address }))
      return result
    }),
  )

  return nfts.flat(1)
}
