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

export const fetchNFTs = async (page: number) => {
  const { publicKey } = await getUserPrincipalId()
  const data = await nftService.getNFTs(Principal.fromText(publicKey), page)
  const { totalItems, totalPages, items } = data
  return { totalItems, totalPages, items }
}

export const fetchNFTsInited = async (page: number) => {
  const { publicKey } = await getUserPrincipalId()
  const data = await nftService.getNFTs(Principal.fromText(publicKey), page)
  const { totalItems, totalPages, items } = data
  const initedData = await Promise.all(items.map((item) => item.init()))
  return { totalItems, totalPages, initedData }
}

export const fetchNFT = async (id: string, currentPage?: number) => {
  const { publicKey } = await getUserPrincipalId()
  const data = await nftService.getNFTById(
    id,
    Principal.fromText(publicKey),
    currentPage || 1,
  )
  return data
}
