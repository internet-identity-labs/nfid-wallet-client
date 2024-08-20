import { getPrincipal } from "frontend/integration/lambda/util/util"
import { NFT } from "frontend/integration/nft/nft"
import { nftService } from "frontend/integration/nft/nft-service"

import { GlauberTS } from "./search"

export const searchTokens = (tokens: NFT[], search: string) => {
  let result = tokens
  if (search) {
    result = tokens.filter((token) => GlauberTS.containsDeep(search)(token))
  }
  return result
}

export const fetchNFTs = async () => {
  const principal = await getPrincipal()
  const data = await nftService.getNFTs(principal)
  return data.items
}

export const fetchNFT = async (id: string) => {
  const principal = await getPrincipal()
  const data = await nftService.getNFTById(id, principal)
  return data
}
