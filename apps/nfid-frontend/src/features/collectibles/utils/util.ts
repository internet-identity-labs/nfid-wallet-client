import { Principal } from "@dfinity/principal"

import { authState } from "@nfid/integration"

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

export const fetchAllNFTs = async () => {
  const { publicKey } = authState.getUserIdData()
  const data = await nftService.getNFTs(Principal.fromText(publicKey))
  const { totalItems, totalPages, items, nftsWithoutPrice } = data
  return { totalItems, totalPages, items, nftsWithoutPrice }
}

export const fetchNFTs = async (page?: number, limit?: number) => {
  const { publicKey } = authState.getUserIdData()
  const data = await nftService.getNFTs(
    Principal.fromText(publicKey),
    page,
    limit,
  )
  const { totalItems, totalPages, items, nftsWithoutPrice } = data
  return { totalItems, totalPages, items, nftsWithoutPrice }
}

export const fetchNFT = async (
  id: string,
  currentPage?: number,
  limit?: number,
) => {
  const { publicKey } = authState.getUserIdData()
  const data = await nftService.getNFTByTokenId(
    id,
    Principal.fromText(publicKey),
    currentPage,
    limit,
  )
  return data
}
