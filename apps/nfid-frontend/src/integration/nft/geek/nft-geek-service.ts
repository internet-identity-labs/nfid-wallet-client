import { Principal } from "@dfinity/principal"
import { DataStructure, MappedToken } from "src/integration/nft/geek/geek-types"

import { ic } from "@nfid/integration"

import { mockGeekResponse } from "../mock/mock"

export class NftGeekService {
  async getNftGeekData(userPrincipal: Principal): Promise<MappedToken[]> {
    return this.fetchNftGeekData(userPrincipal.toText()).then((data) => {
      return this.mapDataToObjects(data)
    })
  }

  private fetchNftGeekData(userPrincipal: string): Promise<DataStructure> {
    debugger
    userPrincipal =
      "j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae"
    const str = `/api/nfid/principal/${userPrincipal}/registry`
    let url = ic.isLocal ? "api_nftgeek_app" : `https://api.nftgeek.app${str}`

    console.log("str", `https://api.nftgeek.app${str}`)
    url += str
    // url =
    //   "https://api.nftgeek.app/api/nfid/principal/j5zf4-bzab2-e5w4v-kagxz-p35gy-vqyam-gazwu-vhgmz-bb3bh-nlwxc-tae/registry"
    //const url = `https://api.nftgeek.app/api/nfid/principal/${userPrincipal}/registry`
    return fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json())
    // @ts-ignore
    //return Promise.resolve(mockGeekResponse)
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
