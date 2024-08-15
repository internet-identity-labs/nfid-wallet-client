import { Principal } from "@dfinity/principal"

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

export const fetchNFTs = async (principalId: string) => {
  const principal = Principal.fromText(principalId)
  const data = await nftService.getNFTs(principal)
  return data.items
}
