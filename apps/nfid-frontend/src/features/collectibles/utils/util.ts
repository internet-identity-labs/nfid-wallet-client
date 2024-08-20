import { Principal } from "@dfinity/principal"

import { authState, Chain, getPublicKey } from "@nfid/integration"

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
  const identity = authState.get().delegationIdentity
  if (!identity) return
  const principalString = await getPublicKey(identity, Chain.IC)
  const principal = Principal.fromText(principalString)
  const data = await nftService.getNFTs(principal)
  return data.items
}
