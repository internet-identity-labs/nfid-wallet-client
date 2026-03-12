import { Principal } from "@dfinity/principal"
import { ttlCacheService } from "@nfid/client-db"
import { DataStructure, MappedToken } from "src/integration/nft/geek/geek-types"

import { ic } from "@nfid/integration"

const NFT_GEEK_CACHE_TTL = 30 * 1000
export const ICP_NFT_GEEK_CACHE_NAME = "ICP_NFT_GEEK_"

export class NftGeekService {
  async getNftGeekData(userPrincipal: Principal): Promise<MappedToken[]> {
    const cacheKey = `${ICP_NFT_GEEK_CACHE_NAME}${userPrincipal.toText()}`
    return ttlCacheService.getOrFetch(
      cacheKey,
      () =>
        this.fetchNftGeekData(userPrincipal.toText()).then((data) =>
          this.mapDataToObjects(data),
        ),
      NFT_GEEK_CACHE_TTL,
      {
        serialize: JSON.stringify,
        deserialize: (v) => JSON.parse(v as string) as MappedToken[],
      },
    )
  }

  private async fetchNftGeekData(
    userPrincipal: string,
  ): Promise<DataStructure> {
    const str = `/nfid/principal/${userPrincipal}/registry`
    const url = ic.isLocal
      ? `/nft_geek_api${str}`
      : `https://api.nftgeek.app/api${str}`
    return await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json())
  }

  private mapDataToObjects(data: DataStructure): MappedToken[] {
    const { registry, collections } = data
    const mappedTokens: MappedToken[] = []

    collections.forEach((collection) => {
      const registryItem = registry[collection.canisterId]
      if (registryItem) {
        registryItem.tokens
          .sort((a, b) => b.timeMillis - a.timeMillis)
          .forEach((token) => {
            const mappedToken: MappedToken = {
              millis: token.timeMillis,
              marketPlace: collection.interface,
              tokenId: token.tokenId,
              collectionId: collection.canisterId,
              collectionName: collection.name,
              tokenFloorPriceIcp: registryItem.tokenFloorPriceIcp,
              tokenFloorPriceUSD: registryItem.tokenFloorPriceUsd,
            }
            mappedTokens.push(mappedToken)
          })
      }
    })
    return mappedTokens
  }
}

export const nftGeekService = new NftGeekService()
