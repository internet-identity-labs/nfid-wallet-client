import { Principal } from "@dfinity/principal"
import { getUserPrincipalId } from "packages/ui/src/organisms/tokens/utils"

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

export const fetchNFTs = async (page?: number, limit?: number) => {
  const { publicKey } = await getUserPrincipalId()
  const data = await nftService.getNFTs(
    Principal.fromText(publicKey),
    page,
    limit,
  )
  const { totalItems, totalPages, items } = data
  return { totalItems, totalPages, items }
}

export const fetchNFT = async (
  id: string,
  currentPage?: number,
  limit?: number,
) => {
  const { publicKey } = await getUserPrincipalId()
  const data = await nftService.getNFTByTokenId(
    id,
    Principal.fromText(publicKey),
    currentPage,
    limit,
  )
  return data
}
