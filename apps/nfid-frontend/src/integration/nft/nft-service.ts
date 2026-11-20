import { Principal } from "@icp-sdk/core/principal"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"
import { integrationCache } from "packages/integration/src/cache"
import { arbitrumService } from "frontend/integration/ethereum/arbitrum/arbitrum.service"
import { baseService } from "frontend/integration/ethereum/base/base.service"
import { ethereumService } from "frontend/integration/ethereum/eth/ethereum.service"
import { polygonService } from "frontend/integration/ethereum/polygon/polygon.service"
import { EvmNftImpl } from "src/integration/nft/impl/evm/nft-evm"
import { NftIcrc7 } from "src/integration/nft/impl/icrc7/nft-icrc7"
import { nftGeekService } from "src/integration/nft/geek/nft-geek-service"
import { nftMapper } from "src/integration/nft/impl/nft-mapper"
import { PaginatedResponse } from "src/integration/nft/impl/nft-types"
import { NFT } from "src/integration/nft/nft"

import { exchangeRateService } from "@nfid/integration"
import {
  icrc7RegistryService,
  marketplaceService,
} from "@nfid/integration/marketplace"
import { State } from "@nfid/integration/token/icrc1/enum/enums"

import type { FT } from "../ft/ft"

export class NftService {
  async getICPNFTs(userPrincipal: Principal): Promise<NFT[]> {
    const data = await nftGeekService.getNftGeekData(userPrincipal)
    const nfts = data
      .map(nftMapper.toNFT)
      .filter((nft): nft is NFT => nft !== null)
    await Promise.all(nfts.map((nft) => nft.init()))
    return nfts
  }

  async getEVMNFTs(_userPrincipal: Principal): Promise<NFT[]> {
    let address: string
    try {
      address = await ethereumService.getQuickAddress()
    } catch {
      return []
    }
    return this.getEVMNFTsByAddress(address)
  }

  private async getEVMNFTsByAddress(address: string): Promise<NFT[]> {
    const services = [
      ethereumService,
      baseService,
      polygonService,
      arbitrumService,
    ]
    const settled = await Promise.allSettled(
      services.map((svc) => svc.getNFTs(address)),
    )
    const assets = settled.flatMap((r) =>
      r.status === "fulfilled" ? r.value : [],
    )
    const nfts = assets.map((asset) => new EvmNftImpl(asset))
    await Promise.all(nfts.map((nft) => nft.init()))
    return nfts
  }

  async getViewOnlyNFTs(
    address: string,
    addressType: "icp" | "evm" | "btc",
    page: number = 1,
    limitPerPage: number = Number.MAX_SAFE_INTEGER,
  ): Promise<PaginatedResponse<NFT>> {
    let rawData: NFT[] = []

    if (addressType === "btc")
      return {
        items: [],
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        nftsWithoutPrice: 0,
      }

    if (addressType === "icp") {
      const principal = Principal.fromText(address)
      const [icpNfts, icrc7Nfts] = await Promise.all([
        this.getICPNFTs(principal),
        this.getIcrc7NFTs(principal),
      ])
      rawData = [...icpNfts, ...icrc7Nfts]
    } else if (addressType === "evm") {
      rawData = await this.getEVMNFTsByAddress(address)
    }

    const nftsWithoutPrice = rawData.filter(
      (nft) => nft.getTokenFloorPriceUSD() === undefined || nft.getError(),
    ).length
    const totalItems = rawData.length
    const totalPages = Math.ceil(totalItems / limitPerPage)
    const startIndex = (page - 1) * limitPerPage
    const endIndex = Math.min(startIndex + limitPerPage, totalItems)
    const items = rawData
      .slice(startIndex, endIndex)
      .sort(
        (a, b) => (b.getTokenFloorPrice() ?? 0) - (a.getTokenFloorPrice() ?? 0),
      )

    return {
      items,
      currentPage: page,
      totalPages,
      totalItems,
      nftsWithoutPrice,
    }
  }

  async getIcrc7NFTs(userPrincipal: Principal): Promise<NFT[]> {
    const [collections, storedCollections] = await Promise.all([
      marketplaceService.getCollections(),
      icrc7RegistryService.getStoredCollections(),
    ])
    const inactiveIds = new Set(
      storedCollections
        .filter((c) => c.state === State.Inactive)
        .map((c) => c.canisterId),
    )
    const results = await Promise.all(
      collections
        .filter((c) => !inactiveIds.has(c.canisterId))
        .map(async (col) => {
          const tokenIds = await marketplaceService.getOwnedTokenIds(
            col.canisterId,
            userPrincipal,
          )
          if (!tokenIds.length) return []
          const metadataMap = await marketplaceService.getTokenMetadata(
            col.canisterId,
            tokenIds,
          )
          return tokenIds.map((tokenId): NftIcrc7 => {
            const entries = metadataMap.get(tokenId) ?? []
            const getText = (key: string) => {
              const entry = entries.find(([k]) => k === key)
              return entry && "Text" in entry[1] ? entry[1].Text : undefined
            }
            const attributesEntry = entries.find(
              ([k]) => k === "icrc7:attributes",
            )
            const traitEntries: [string, string][] =
              attributesEntry && "Array" in attributesEntry[1]
                ? attributesEntry[1].Array.flatMap((item) => {
                    if (!("Map" in item)) return []
                    const map = item.Map
                    const traitType = map.find(([k]) => k === "trait_type")?.[1]
                    const value = map.find(([k]) => k === "value")?.[1]
                    if (!traitType || !value) return []
                    const category =
                      "Text" in traitType ? traitType.Text : undefined
                    const option =
                      "Text" in value
                        ? value.Text
                        : "Nat" in value
                          ? String(value.Nat)
                          : undefined
                    return category && option
                      ? [[category, option] as [string, string]]
                      : []
                  })
                : []
            return new NftIcrc7(
              col.canisterId,
              col.name,
              tokenId,
              getText("icrc7:name"),
              getText("icrc7:metadata:uri:image") ??
                getText("icrc7:metadata:image") ??
                getText("icrc7:image"),
              col.description,
              traitEntries,
              col.tradable,
            )
          })
        }),
    )
    return results.flat()
  }

  async getNFTs(
    userPrincipal: Principal,
    page: number = 1,
    limitPerPage: number = Number.MAX_SAFE_INTEGER,
  ): Promise<PaginatedResponse<NFT>> {
    const [icpNfts, evmNfts, icrc7Nfts] = await Promise.all([
      this.getICPNFTs(userPrincipal),
      this.getEVMNFTs(userPrincipal),
      this.getIcrc7NFTs(userPrincipal),
    ])

    const rawData = [...icpNfts, ...evmNfts, ...icrc7Nfts]

    const nftsWithoutPrice = rawData.filter(
      (nft) => nft.getTokenFloorPriceUSD() === undefined || nft.getError(),
    ).length

    const totalItems = rawData.length
    const totalPages = Math.ceil(totalItems / limitPerPage)

    const startIndex = (page - 1) * limitPerPage
    const endIndex = Math.min(startIndex + limitPerPage, totalItems)

    const items = rawData.slice(startIndex, endIndex)

    const sortedItems = items.sort(
      (a, b) => (b.getTokenFloorPrice() ?? 0) - (a.getTokenFloorPrice() ?? 0),
    )

    return {
      items: sortedItems,
      currentPage: page,
      totalPages,
      totalItems,
      nftsWithoutPrice,
    }
  }

  async getNFTsTotalICPPrice(nfts: NFT[] | undefined) {
    if (!nfts || nfts.length === 0) return new BigNumber(0)

    return nfts
      .filter((nft) => !nft.getError())
      .map((nft) => nft.getTokenFloorPrice())
      .filter((price): price is number => price !== undefined)
      .reduce((sum, price) => sum.plus(price), new BigNumber(0))
  }

  @Cache(integrationCache, { ttl: 300 })
  async getNFTsTotalPrice(
    nfts?: NFT[],
    icp?: FT,
  ): Promise<
    | {
        value: string
        dayChangePercent?: string
        dayChange?: string
        dayChangePositive?: boolean
        value24h?: string
      }
    | undefined
  > {
    if (!nfts || nfts.length === 0) return

    await Promise.all([
      ...nfts.map((nft) =>
        nft.isInited() ? Promise.resolve(nft) : nft.init(),
      ),
      exchangeRateService.cacheUsdIcpRate(),
    ])

    const usdBalance = nfts
      .filter((nft) => !nft.getError())
      .map((nft) => BigNumber(nft.getTokenFloorPriceUSD()?.toFixed(2) ?? 0))
      .reduce((sum, usd) => sum.plus(usd), new BigNumber(0))

    if (!icp) return { value: usdBalance.toString() }

    const tokenRate = await exchangeRateService.usdPriceForICRC1(
      icp.getTokenAddress(),
    )

    if (!tokenRate) return { value: usdBalance.toString() }

    const usdBalanceDayChange = icp.getUSDBalanceDayChange(usdBalance)
    const tokenRateDayChange = icp.getTokenRateDayChangePercent()

    if (!usdBalanceDayChange) return { value: usdBalance.toString() }

    return {
      value: usdBalance.toString(),
      dayChangePercent: tokenRateDayChange?.value ?? "0.00",
      dayChange: usdBalanceDayChange.toFixed(2),
      dayChangePositive: usdBalanceDayChange.gte(0),
      value24h: usdBalance.minus(usdBalanceDayChange).toFixed(2),
    }
  }

  async getNFTByTokenId(
    id: string,
    userPrincipal: Principal,
    collectionId?: string,
    pages: number = 1,
    limit: number = Number.MAX_SAFE_INTEGER,
  ): Promise<NFT | undefined> {
    const nftList = await this.getNFTs(userPrincipal, 1, pages * limit)
    const nft = nftList.items
      .find(
        (nft) =>
          nft.getTokenId() === id &&
          (!collectionId || nft.getCollectionId() === collectionId),
      )
      ?.init()
    if (!nft) throw new Error("NFT not found")
    return nft
  }

  async getViewOnlyNFTByTokenId(
    id: string,
    address: string,
    addressType: "icp" | "evm" | "btc",
    collectionId?: string,
    pages: number = 1,
    limit: number = Number.MAX_SAFE_INTEGER,
  ): Promise<NFT | undefined> {
    const nftList = await this.getViewOnlyNFTs(
      address,
      addressType,
      1,
      pages * limit,
    )
    const nft = nftList.items
      .find(
        (nft) =>
          nft.getTokenId() === id &&
          (!collectionId || nft.getCollectionId() === collectionId),
      )
      ?.init()
    if (!nft) throw new Error("NFT not found")
    return nft
  }

  async getPublicIcrc7NFT(collectionId: string, tokenId: string): Promise<NFT> {
    const tokenIdBig = BigInt(tokenId)
    const [collections, metadataMap] = await Promise.all([
      marketplaceService.getCollections(),
      marketplaceService.getTokenMetadata(collectionId, [tokenIdBig]),
    ])
    const collection = collections.find((c) => c.canisterId === collectionId)
    if (!collection) throw new Error(`Collection ${collectionId} not found`)
    const entries = metadataMap.get(tokenIdBig) ?? []
    const getText = (key: string) => {
      const entry = entries.find(([k]) => k === key)
      return entry && "Text" in entry[1] ? entry[1].Text : undefined
    }
    const attributesEntry = entries.find(([k]) => k === "icrc7:attributes")
    const traitEntries: [string, string][] =
      attributesEntry && "Array" in attributesEntry[1]
        ? attributesEntry[1].Array.flatMap((item) => {
            if (!("Map" in item)) return []
            const map = item.Map
            const traitType = map.find(([k]) => k === "trait_type")?.[1]
            const value = map.find(([k]) => k === "value")?.[1]
            if (!traitType || !value) return []
            const category = "Text" in traitType ? traitType.Text : undefined
            const option =
              "Text" in value
                ? value.Text
                : "Nat" in value
                  ? String(value.Nat)
                  : undefined
            return category && option
              ? [[category, option] as [string, string]]
              : []
          })
        : []
    return new NftIcrc7(
      collectionId,
      collection.name,
      tokenIdBig,
      getText("icrc7:name"),
      getText("icrc7:metadata:uri:image") ??
        getText("icrc7:metadata:image") ??
        getText("icrc7:image"),
      collection.description,
      traitEntries,
      collection.tradable,
    )
  }
}

export const nftService = new NftService()
