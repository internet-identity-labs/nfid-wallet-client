import { Principal } from "@dfinity/principal"
import { DataStructure, MappedToken } from "src/integration/nft/geek/geek-types"

export class NftGeekService {
  async getNftGeekData(userPrincipal: Principal): Promise<MappedToken[]> {
    return this.fetchNftGeekData(userPrincipal.toText()).then((data) => {
      return this.mapDataToObjects(data)
    })
  }

  private fetchNftGeekData(userPrincipal: string): Promise<DataStructure> {
    const url = `https://api.nftgeek.app/api/nfid/principal/${userPrincipal}/registry`
    return fetch(url, {
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
          .sort((a, b) => a.timeMillis - b.timeMillis)
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
