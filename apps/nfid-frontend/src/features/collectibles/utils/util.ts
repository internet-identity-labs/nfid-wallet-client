import { Principal } from "@icp-sdk/core/principal"

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
  collectionId?: string,
  currentPage?: number,
  limit?: number,
) => {
  try {
    const { publicKey } = authState.getUserIdData()
    return await nftService.getNFTByTokenId(
      id,
      Principal.fromText(publicKey),
      collectionId,
      currentPage,
      limit,
    )
  } catch {
    if (collectionId) {
      try {
        return await nftService.getPublicIcrc7NFT(collectionId, id)
      } catch (e) {
        console.error(e)
      }
    }
  }
}

export const fetchViewOnlyNFT = async (
  id: string,
  viewOnlyAddress: string,
  viewOnlyAddressType: "icp" | "evm" | "btc",
  collectionId?: string,
  currentPage?: number,
  limit?: number,
) => {
  try {
    return await nftService.getViewOnlyNFTByTokenId(
      id,
      viewOnlyAddress,
      viewOnlyAddressType,
      collectionId,
      currentPage,
      limit,
    )
  } catch {
    if (collectionId) {
      try {
        return await nftService.getPublicIcrc7NFT(collectionId, id)
      } catch (e) {
        console.error(e)
      }
    }
  }
}
