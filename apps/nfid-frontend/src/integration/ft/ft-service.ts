import { Principal } from "@dfinity/principal"
import { SignIdentity } from "@dfinity/agent"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"
import { integrationCache } from "packages/integration/src/cache"
import { storageWithTtl, ttlCacheService } from "@nfid/client-db"
import { FT } from "src/integration/ft/ft"

import {
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  ETH_NATIVE_ID,
  EVM_NATIVE,
  ICP_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { icrc1StorageService } from "@nfid/integration/token/icrc1/service/icrc1-storage-service"

import { ShroffIcpSwapImpl } from "../swap/icpswap/impl/shroff-icp-swap-impl"
import { KongSwapShroffImpl } from "../swap/kong/impl/kong-swap-shroff"
import { AllowanceDetailDTO } from "@nfid/integration/token/icrc1/types"
import { mapCategory, mapState } from "@nfid/integration/token/icrc1/util"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { ethErc20Service } from "../ethereum/eth/eth-erc20.service"
import { polygonErc20Service } from "../ethereum/polygon/pol-erc20.service"
import { baseErc20Service } from "../ethereum/base/base-erc20.service"
import { arbitrumErc20Service } from "../ethereum/arbitrum/arbitrum-erc20.service"
import { tokenFactory } from "./token-creator/token-factory.service"
import { arbSepoliaErc20Service } from "../ethereum/arbitrum/testnetwork/arb-sepolia-erc20.service"
import { baseSepoliaErc20Service } from "../ethereum/base/testnetwork/base-sepolia-erc20.service"
import { polygonAmoyErc20Service } from "../ethereum/polygon/testnetwork/pol-amoy-erc20.service"
import { ethSepoliaErc20Service } from "../ethereum/eth/testnetwork/eth-sepolia-erc20.service"

export const INITED_TOKENS_CACHE_NAME = "InitedTokens_"
export const TOKENS_REFRESH_INTERVAL = 30000
export const PAGE_SIZE = 10

export interface TokensAvailableToSwap {
  to: string[]
  from: string[]
}

export class FtService {
  async getTokens(userId: string): Promise<Array<FT>> {
    const icrc1Tokens = await icrc1StorageService
      .getICRC1Canisters(userId)
      .then(async (canisters) => {
        const icp = canisters.find(
          (canister) => canister.ledger === ICP_CANISTER_ID,
        )

        const nfidw = canisters.find(
          (canister) => canister.ledger === NFIDW_CANISTER_ID,
        )

        const ckBtc = canisters.find(
          (canister) => canister.ledger === CKBTC_CANISTER_ID,
        )

        const ckEth = canisters.find(
          (canister) => canister.ledger === CKETH_LEDGER_CANISTER_ID,
        )

        const updatePromises: Promise<void>[] = []

        if (!icp || icp.state === State.Inactive) {
          updatePromises.push(
            icrc1RegistryService.storeICRC1Canister(
              ICP_CANISTER_ID,
              State.Active,
            ),
          )
        }

        if (!nfidw || nfidw.state === State.Inactive) {
          updatePromises.push(
            icrc1RegistryService.storeICRC1Canister(
              NFIDW_CANISTER_ID,
              State.Active,
            ),
          )
        }

        if (!ckBtc || ckBtc.state === State.Inactive) {
          updatePromises.push(
            icrc1RegistryService.storeICRC1Canister(
              CKBTC_CANISTER_ID,
              State.Active,
            ),
          )
        }

        if (!ckEth || ckEth.state === State.Inactive) {
          updatePromises.push(
            icrc1RegistryService.storeICRC1Canister(
              CKETH_LEDGER_CANISTER_ID,
              State.Active,
            ),
          )
        }

        await Promise.all(updatePromises)

        if (updatePromises.length > 0) {
          canisters = await icrc1StorageService.getICRC1Canisters(userId)
        }

        const ft = canisters.map((canister) =>
          tokenFactory.getCreatorByChainID(ChainId.ICP).buildTokens(canister),
        )

        return ft
      })

    const userCanisters = await icrc1RegistryService.getStoredUserTokens()

    const [
      ethErc20Tokens,
      polErc20Tokens,
      baseErc20Tokens,
      arbErc20Tokens,
      arbSepoliaErc20Tokens,
      baseSepoliaErc20Tokens,
      polAmoyErc20Tokens,
      ethSepoliaErc20Tokens,
    ] = await Promise.all([
      ethErc20Service.getTokensList(),
      polygonErc20Service.getTokensList(),
      baseErc20Service.getTokensList(),
      arbitrumErc20Service.getTokensList(),
      arbSepoliaErc20Service.getTokensList(),
      baseSepoliaErc20Service.getTokensList(),
      polygonAmoyErc20Service.getTokensList(),
      ethSepoliaErc20Service.getTokensList(),
    ])

    const allErc20Tokens = [
      ...ethErc20Tokens,
      ...polErc20Tokens,
      ...baseErc20Tokens,
      ...arbErc20Tokens,
      ...arbSepoliaErc20Tokens,
      ...baseSepoliaErc20Tokens,
      ...polAmoyErc20Tokens,
      ...ethSepoliaErc20Tokens,
    ]

    const nativeTokens: FT[] = [
      tokenFactory.getCreatorByChainID(ChainId.ETH).buildNative(),
      tokenFactory.getCreatorByChainID(ChainId.BTC).buildNative(),

      tokenFactory.getCreatorByChainID(ChainId.POL).buildNative(
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.POL && c.ledger === EVM_NATIVE,
          )?.state ?? {
            Inactive: null,
          },
        ),
      ),

      tokenFactory.getCreatorByChainID(ChainId.POL_AMOY).buildNative(
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.POL_AMOY && c.ledger === EVM_NATIVE,
          )?.state ?? {
            Inactive: null,
          },
        ),
      ),

      tokenFactory.getCreatorByChainID(ChainId.ARB).buildNative(
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.ARB && c.ledger === EVM_NATIVE,
          )?.state ?? {
            Inactive: null,
          },
        ),
      ),

      tokenFactory.getCreatorByChainID(ChainId.ARB_SEPOLIA).buildNative(
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.ARB_SEPOLIA && c.ledger === EVM_NATIVE,
          )?.state ?? {
            Inactive: null,
          },
        ),
      ),

      tokenFactory.getCreatorByChainID(ChainId.BASE).buildNative(
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.BASE && c.ledger === EVM_NATIVE,
          )?.state ?? {
            Inactive: null,
          },
        ),
      ),

      tokenFactory.getCreatorByChainID(ChainId.BASE_SEPOLIA).buildNative(
        mapState(
          userCanisters.find(
            (c) =>
              c.network === ChainId.BASE_SEPOLIA && c.ledger === EVM_NATIVE,
          )?.state ?? {
            Inactive: null,
          },
        ),
      ),

      tokenFactory.getCreatorByChainID(ChainId.ETH_SEPOLIA).buildNative(
        mapState(
          userCanisters.find(
            (c) => c.network === ChainId.ETH_SEPOLIA && c.ledger === EVM_NATIVE,
          )?.state ?? {
            Inactive: null,
          },
        ),
      ),
    ]

    const erc20Tokens: FT[] = allErc20Tokens.map((token) =>
      tokenFactory
        .getCreatorByChainID(token.chainId)
        .buildTokens(
          token,
          mapState(
            userCanisters.find(
              (c) => c.network === token.chainId && c.ledger === token.address,
            )?.state ?? { Inactive: null },
          ),
        ),
    )

    return this.sortTokens([...icrc1Tokens, ...nativeTokens, ...erc20Tokens])
  }

  async getBtcViewOnlyTokens(): Promise<FT[]> {
    return [tokenFactory.getCreatorByChainID(ChainId.BTC).buildNative()]
  }

  async getIcpViewOnlyTokens(address: string): Promise<FT[]> {
    const defaultActiveIds = [
      ICP_CANISTER_ID,
      NFIDW_CANISTER_ID,
      CKBTC_CANISTER_ID,
      CKETH_LEDGER_CANISTER_ID,
    ]
    const principal = Principal.fromText(address)
    const oracleTokens = await icrc1OracleService.getICRC1Canisters()

    const buildToken = (icrc1: (typeof oracleTokens)[0], state: State) =>
      tokenFactory.getCreatorByChainID(ChainId.ICP).buildTokens({
        decimals: icrc1.decimals,
        fee: icrc1.fee,
        ledger: icrc1.ledger,
        name: icrc1.name,
        symbol: icrc1.symbol,
        logo: icrc1.logo[0],
        index: icrc1.index[0],
        rootCanisterId: icrc1.root_canister_id[0],
        state,
        category: mapCategory(icrc1.category),
      })

    const inactiveOracleTokens = oracleTokens.filter(
      (icrc1) => !defaultActiveIds.includes(icrc1.ledger),
    )
    const inactiveFtTokens = inactiveOracleTokens.map((icrc1) =>
      buildToken(icrc1, State.Inactive),
    )
    const scanned = await this.filterNotActiveNotZeroBalancesTokens(
      inactiveFtTokens,
      principal,
    )
    const scannedIds = new Set(scanned.map((t) => t.getTokenAddress()))

    const allTokens = oracleTokens.map((icrc1) => {
      if (defaultActiveIds.includes(icrc1.ledger))
        return buildToken(icrc1, State.Active)
      if (scannedIds.has(icrc1.ledger)) return buildToken(icrc1, State.Active)
      return buildToken(icrc1, State.Inactive)
    })
    return this.sortTokens(allTokens)
  }

  async getEvmViewOnlyTokens(address: string): Promise<FT[]> {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))

    const arbTokens =
      await arbitrumErc20Service.getTokensWithNonZeroBalance(address)
    await delay(500)
    const polTokens =
      await polygonErc20Service.getTokensWithNonZeroBalance(address)
    await delay(500)
    const baseTokens =
      await baseErc20Service.getTokensWithNonZeroBalance(address)
    await delay(500)
    const ethTokens = await ethErc20Service.getTokensWithNonZeroBalance(address)

    const nativeTokens: FT[] = [
      tokenFactory.getCreatorByChainID(ChainId.ETH).buildNative(),
      tokenFactory.getCreatorByChainID(ChainId.POL).buildNative(State.Active),
      tokenFactory.getCreatorByChainID(ChainId.ARB).buildNative(State.Active),
      tokenFactory.getCreatorByChainID(ChainId.BASE).buildNative(State.Active),
    ]

    const erc20Tokens: FT[] = [
      ...arbTokens.map((t) =>
        tokenFactory
          .getCreatorByChainID(ChainId.ARB)
          .buildTokens(t, State.Active),
      ),
      ...polTokens.map((t) =>
        tokenFactory
          .getCreatorByChainID(ChainId.POL)
          .buildTokens(t, State.Active),
      ),
      ...baseTokens.map((t) =>
        tokenFactory
          .getCreatorByChainID(ChainId.BASE)
          .buildTokens(t, State.Active),
      ),
      ...ethTokens.map((t) =>
        tokenFactory
          .getCreatorByChainID(ChainId.ETH)
          .buildTokens(t, State.Active),
      ),
    ]

    return this.sortTokens([...nativeTokens, ...erc20Tokens])
  }

  public async getInitedTokens(
    tokens: FT[],
    principal: Principal,
    refetch?: boolean,
    viewOnlyAddress?: string,
  ): Promise<FT[]> {
    const cacheKey = viewOnlyAddress
      ? `${INITED_TOKENS_CACHE_NAME}viewOnly_${viewOnlyAddress}`
      : this.getCacheKey(principal)
    return ttlCacheService.getOrFetch(
      cacheKey,
      () => this.fetchInitedTokens(tokens, principal, viewOnlyAddress),
      TOKENS_REFRESH_INTERVAL,
      {
        forceRefetch: Boolean(refetch),
        serialize: (v) => this.serializeTokensData(v),
        deserialize: (v) => this.deserializeTokensData(v as string, tokens),
      },
    )
  }

  public async initializeBtcEthTokensWhenReady(
    tokens: FT[],
    principal: Principal,
  ): Promise<FT[]> {
    const btcEthTokens = tokens.filter(
      (token) =>
        (token.getTokenAddress() === BTC_NATIVE_ID ||
          token.getTokenAddress() === ETH_NATIVE_ID) &&
        !token.isInited(),
    )

    if (btcEthTokens.length === 0) return tokens

    const reInited = await Promise.all(
      btcEthTokens.map((token) => token.init(principal)),
    )

    const updatedTokens = tokens.map((token) => {
      const refreshed = reInited.find(
        (t) => t.getTokenAddress() === token.getTokenAddress(),
      )
      return refreshed ?? token
    })

    const cacheKey = this.getCacheKey(principal)
    await storageWithTtl.set(
      cacheKey,
      this.serializeTokensData(updatedTokens),
      TOKENS_REFRESH_INTERVAL,
    )

    return updatedTokens
  }

  async getIcrc2Allowances(
    ft: FT[],
    principal: Principal,
    offset = 0,
    limit = PAGE_SIZE,
    chunkSize = PAGE_SIZE,
  ): Promise<
    Array<{
      token: FT
      allowance: AllowanceDetailDTO
    }>
  > {
    const tokens = ft

    const allFlattened: { token: FT; allowance: AllowanceDetailDTO }[] = []

    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize)
      const chunkAllowances = await Promise.all(
        chunk.map((token) => token.getIcrc2Allowances(principal)),
      )
      chunkAllowances.forEach((allowances, index) => {
        allowances.forEach((a) => {
          allFlattened.push({
            token: chunk[index],
            allowance: a,
          })
        })
      })
    }

    return allFlattened.slice(offset, offset + limit)
  }

  async revokeAllAllowances(
    delegationIdentity: SignIdentity,
    allowances: {
      token: FT
      allowance: AllowanceDetailDTO
    }[],
  ): Promise<void> {
    const icpAllowances = allowances.filter(
      ({ token }) => token.getChainId() === ChainId.ICP,
    )
    const evmAllowances = allowances.filter(
      ({ token }) => token.getChainId() !== ChainId.ICP,
    )

    const icpPromise = Promise.all(
      icpAllowances.map(({ allowance, token }) =>
        token.revokeAllowance(delegationIdentity, allowance.to_spender),
      ),
    )

    const evmChains = new Map<number, typeof evmAllowances>()
    for (const allowance of evmAllowances) {
      const chainId = allowance.token.getChainId()
      if (!evmChains.has(chainId)) evmChains.set(chainId, [])
      evmChains.get(chainId)!.push(allowance)
    }

    const evmPromise = Promise.all(
      [...evmChains.values()].map(async (chainAllowances) => {
        for (const { allowance, token } of chainAllowances) {
          await token.revokeAllowance(delegationIdentity, allowance.to_spender)
        }
      }),
    )

    await Promise.all([icpPromise, evmPromise])
  }

  private getCacheKey(principal: Principal): string {
    return `${INITED_TOKENS_CACHE_NAME}${principal.toText()}`
  }

  private async fetchInitedTokens(
    tokens: FT[],
    principal: Principal,
    viewOnlyAddress?: string,
  ): Promise<FT[]> {
    console.log("inittt")
    return Promise.all(
      tokens.map((token) => token.init(principal, viewOnlyAddress)),
    )
  }

  private serializeTokensData(tokens: FT[]): string {
    return JSON.stringify(
      tokens.map((token) => {
        const tokenRate = token.getTokenRate("1")
        const serializedTokenRate =
          tokenRate === null
            ? null
            : tokenRate !== undefined
              ? tokenRate.toString()
              : undefined

        return {
          tokenAddress: token.getTokenAddress(),
          chainId: token.getChainId(),
          tokenBalance: token.getTokenBalance()?.toString(),
          tokenRate: serializedTokenRate,
          tokenRateDayChangePercent:
            token.getTokenRateDayChangePercent()?.value,
          tokenRateDayChangePercentPositive:
            token.getTokenRateDayChangePercent()?.positive,
          inited: token.isInited(),
          state: token.getTokenState(),
        }
      }),
    )
  }

  private deserializeTokensData(serialized: string, tokens: FT[]): FT[] {
    const cachedData = JSON.parse(serialized)
    tokens.forEach((token) => {
      const data = cachedData.find(
        (d: { tokenAddress: string; chainId?: number }) => {
          const addressMatches = d.tokenAddress === token.getTokenAddress()
          const isEvmNative = d.tokenAddress === EVM_NATIVE
          const chainMatches = isEvmNative
            ? d.chainId === token.getChainId()
            : d.chainId === undefined || d.chainId === token.getChainId()

          return addressMatches && chainMatches
        },
      )
      if (!data) return

      const tokenImpl = token as any

      if (data.tokenBalance) {
        tokenImpl.tokenBalance = BigInt(data.tokenBalance)
      }

      if (data.tokenRate !== undefined) {
        if (data.tokenRate !== null) {
          tokenImpl.tokenRate = {
            value: new BigNumber(data.tokenRate),
            dayChangePercent: data.tokenRateDayChangePercent,
            dayChangePercentPositive: data.tokenRateDayChangePercentPositive,
          }
        } else {
          tokenImpl.tokenRate = null
        }
      }

      tokenImpl.inited = data.inited
      tokenImpl.tokenState = data.state
    })
    return tokens
  }

  @Cache(integrationCache, { ttl: 300 })
  async getTokensAvailableToSwap(sourceToken: string): Promise<string[]> {
    const kongPoolsPromise = KongSwapShroffImpl.getAvailablePools(sourceToken)
    const icpswapPoolsPromise = ShroffIcpSwapImpl.getAvailablePools(sourceToken)

    const [kongPools, icpswapPools] = await Promise.all([
      kongPoolsPromise,
      icpswapPoolsPromise,
    ])

    const pools = [...new Set([...kongPools, ...icpswapPools])]

    return Array.from(pools)
  }

  async filterNotActiveNotZeroBalancesTokens(
    tokens: Array<FT>,
    principal: Principal,
  ): Promise<Array<FT>> {
    return (
      await Promise.all(
        tokens.map(async (t) => {
          if (t.getTokenBalance() !== undefined) return t
          const ftWithBalance = await t.refreshBalance(principal)
          return ftWithBalance
        }),
      )
    ).filter((ft) => {
      const tokenBalance = ft.getTokenBalance()
      return (
        tokenBalance !== undefined &&
        tokenBalance > BigInt(0) &&
        ft.getTokenState() !== State.Active
      )
    })
  }

  async getFTUSDBalance(ft: FT[]): Promise<
    | {
        value: string
        dayChangePercent?: string
        dayChange?: string
        dayChangePositive?: boolean
        value24h?: string
      }
    | undefined
  > {
    const price = ft
      .filter(
        (ft) =>
          ft.getTokenCategory() !== Category.TESTNET &&
          ft.getUSDBalance()?.gt(0),
      )
      .map((ft) => ({
        usdBalance: ft.getUSDBalance()?.toFixed(2),
        usdBalanceDayChange: ft.getUSDBalanceDayChange(),
      }))
      .reduce(
        (
          acc: {
            usdBalance: BigNumber
            usdBalanceDayChange: BigNumber
          },
          ft,
        ) => ({
          usdBalance: acc.usdBalance!.plus(ft.usdBalance!),
          usdBalanceDayChange: acc.usdBalanceDayChange!.plus(
            ft.usdBalanceDayChange || 0,
          ),
        }),
        {
          usdBalance: BigNumber(0),
          usdBalanceDayChange: BigNumber(0),
        },
      )

    return {
      value: price.usdBalance.toString(),
      dayChangePercent: price.usdBalance.eq(0)
        ? "0.00"
        : BigNumber(price.usdBalanceDayChange!)
            .div(price.usdBalance!)
            .multipliedBy(100)
            .abs()
            .toFixed(2),
      dayChange: BigNumber(price.usdBalanceDayChange!).toFixed(2),
      dayChangePositive: price.usdBalanceDayChange!.gte(0),
      value24h: price.usdBalance.minus(price.usdBalanceDayChange).toFixed(2),
    }
  }

  filterTokens(ft: FT[], filterText: string): FT[] {
    return ft.filter(
      (token) =>
        token.getTokenName().toLowerCase().includes(filterText.toLowerCase()) ||
        token.getTokenSymbol().toLowerCase().includes(filterText.toLowerCase()),
    )
  }

  private sortTokens(tokens: FT[]) {
    const categoryOrder: Record<Category, number> = {
      [Category.Sns]: 3,
      [Category.ChainFusion]: 2,
      [Category.Known]: 4,
      [Category.Native]: 1,
      [Category.ERC20]: 6,
      [Category.Community]: 5,
      [Category.Spam]: 9,
      [Category.ChainFusionTestnet]: 7,
      [Category.TESTNET]: 8,
    }

    const topNativeIds = [ICP_CANISTER_ID, BTC_NATIVE_ID, ETH_NATIVE_ID]
    const nfIdTokens = [
      NFIDW_CANISTER_ID,
      CKBTC_CANISTER_ID,
      CKETH_LEDGER_CANISTER_ID,
    ]

    const topNative: FT[] = topNativeIds
      .map((id) => tokens.find((t) => t.getTokenAddress() === id))
      .filter(Boolean) as FT[]
    topNative.forEach((t) => tokens.splice(tokens.indexOf(t), 1))

    const afterNative: FT[] = nfIdTokens
      .map((id) => tokens.find((t) => t.getTokenAddress() === id))
      .filter(Boolean) as FT[]
    afterNative.forEach((t) => tokens.splice(tokens.indexOf(t), 1))

    const remainingNative = tokens.filter(
      (t) => t.getTokenCategory() === Category.Native,
    )
    const others = tokens.filter(
      (t) => t.getTokenCategory() !== Category.Native,
    )

    others.sort((a, b) => {
      const aCat =
        categoryOrder[a.getTokenCategory()] ?? Number.MAX_SAFE_INTEGER
      const bCat =
        categoryOrder[b.getTokenCategory()] ?? Number.MAX_SAFE_INTEGER
      return aCat - bCat
    })

    return [...topNative, ...remainingNative, ...afterNative, ...others]
  }
}

export const ftService = new FtService()
