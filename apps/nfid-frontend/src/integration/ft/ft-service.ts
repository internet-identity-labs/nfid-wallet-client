import { Principal } from "@dfinity/principal"
import { SignIdentity } from "@dfinity/agent"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"
import { integrationCache } from "packages/integration/src/cache"
import { storageWithTtl } from "@nfid/client-db"
import { FT } from "src/integration/ft/ft"
import { FTImpl } from "src/integration/ft/impl/ft-impl"

import {
  ARBITRUM_NATIVE_ID,
  BASE_NATIVE_ID,
  BNB_NATIVE_ID,
  POLYGON_NATIVE_ID,
  BTC_NATIVE_ID,
  CKBTC_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  ETH_NATIVE_ID,
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
// import { erc20Service } from "../ethereum/erc20.service"
// import { FTERC20Impl } from "./impl/ft-erc20-impl"
// import { mapState } from "@nfid/integration/token/icrc1/util"

import { FTBitcoinImpl } from "./impl/ft-btc-impl"
import { FTEthereumImpl } from "./impl/ft-eth-impl"
import { FTPolygonImpl } from "./impl/ft-pol-impl"
import { FTArbitrumImpl } from "./impl/ft-arb-impl"
import { FTBaseImpl } from "./impl/ft-base-impl"
import { FTBnbImpl } from "./impl/ft-bnb-impl"

const InitedTokens = "InitedTokens"
export const TOKENS_REFRESH_INTERVAL = 10000
export const PAGE_SIZE = 10

export interface TokensAvailableToSwap {
  to: string[]
  from: string[]
}

export class FtService {
  async getTokens(userId: string): Promise<Array<FT>> {
    let icrc1Tokens = await icrc1StorageService
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

        const arb = canisters.find(
          (canister) => canister.ledger === ARBITRUM_NATIVE_ID,
        )

        const pol = canisters.find(
          (canister) => canister.ledger === POLYGON_NATIVE_ID,
        )

        const bnb = canisters.find(
          (canister) => canister.ledger === BNB_NATIVE_ID,
        )

        const base = canisters.find(
          (canister) => canister.ledger === BASE_NATIVE_ID,
        )

        const updatePromises = []

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

        const ft = canisters.map((canister) => new FTImpl(canister))
        return ft
      })

    // TODO: Fix an issue with a lot of rerenders when changing State
    // Try to implement setState method in FTPolygonImpl instead of FTEvmAbstractImpl
    // const baseState = userCanisters.find(
    //   (uc) => uc.ledger === BASE_NATIVE_ID,
    // )?.state

    // const bnbState = userCanisters.find(
    //   (uc) => uc.ledger === BNB_NATIVE_ID,
    // )?.state

    // const polState = userCanisters.find(
    //   (uc) => uc.ledger === POLYGON_NATIVE_ID,
    // )?.state

    // const arbState = userCanisters.find(
    //   (uc) => uc.ledger === ARBITRUM_NATIVE_ID,
    // )?.state

    const ethNativeToken = new FTEthereumImpl()
    const btcNativeToken = new FTBitcoinImpl()
    const polNativeToken = new FTPolygonImpl()
    const arbNativeToken = new FTArbitrumImpl()
    const baseNativeToken = new FTBaseImpl()
    const bnbNativeToken = new FTBnbImpl()

    // Use this for ERC-20 tokens
    // const erc20Tokens = await erc20Service.getKnownTokensList()
    // let userCanisters = await icrc1RegistryService.getCanistersByRoot(userId)

    // const storedErc20Tokens: FT[] = erc20Tokens.map((token) => {
    //   const userCanister = userCanisters.find(
    //     (t) => t.ledger === token.address && t.network === token.chainId,
    //   )
    //   return new FTERC20Impl({
    //     ...token,
    //     state: userCanister ? mapState(userCanister.state) : token.state,
    //   })
    // })

    return this.sortTokens([
      ...icrc1Tokens,
      ethNativeToken,
      btcNativeToken,
      polNativeToken,
      arbNativeToken,
      baseNativeToken,
      bnbNativeToken,
      //...storedErc20Tokens,
    ])
  }

  public async getInitedTokens(
    tokens: FT[],
    principal: Principal,
    refetch?: boolean,
  ): Promise<FT[]> {
    const cacheKey = this.getCacheKey(principal)
    const cache = await storageWithTtl.getEvenExpired(cacheKey)

    if (!cache || Boolean(refetch)) {
      const initedTokens = await this.fetchInitedTokens(tokens, principal)

      await storageWithTtl.set(
        cacheKey,
        this.serializeTokensData(initedTokens),
        TOKENS_REFRESH_INTERVAL,
      )

      return initedTokens
    }

    if (cache && cache.expired) {
      this.fetchInitedTokens(tokens, principal).then((initedTokens) => {
        storageWithTtl.set(
          cacheKey,
          this.serializeTokensData(initedTokens),
          TOKENS_REFRESH_INTERVAL,
        )
      })

      return this.deserializeTokensData(cache.value as string, tokens)
    }

    return this.deserializeTokensData(cache?.value as string, tokens)
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
    const tokens = ft.filter((token) => token.getChainId() === ChainId.ICP)

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
    await Promise.all(
      allowances.map(({ allowance, token }) =>
        token.revokeAllowance(delegationIdentity, allowance.to_spender),
      ),
    )
  }

  private getCacheKey(principal: Principal): string {
    return `${InitedTokens}_${principal.toText()}`
  }

  private async fetchInitedTokens(
    tokens: FT[],
    principal: Principal,
  ): Promise<FT[]> {
    return Promise.all(tokens.map((token) => token.init(principal)))
  }

  private serializeTokensData(tokens: FT[]): string {
    return JSON.stringify(
      tokens.map((token) => ({
        tokenAddress: token.getTokenAddress(),
        tokenBalance: token.getTokenBalance()?.toString(),
        tokenRate: token.getTokenRate("1")?.toString(),
        tokenRateDayChangePercent: token.getTokenRateDayChangePercent()?.value,
        tokenRateDayChangePercentPositive:
          token.getTokenRateDayChangePercent()?.positive,
        inited: token.isInited(),
        state: token.getTokenState(),
      })),
    )
  }

  private deserializeTokensData(serialized: string, tokens: FT[]): FT[] {
    const cachedData = JSON.parse(serialized)
    return tokens.map((token) => {
      const data = cachedData.find(
        (d: { tokenAddress: string }) =>
          d.tokenAddress === token.getTokenAddress(),
      )

      const tokenImpl = token as any

      if (data.tokenBalance) {
        tokenImpl.tokenBalance = BigInt(data.tokenBalance)
      }

      if (data.tokenRate) {
        tokenImpl.tokenRate = {
          value: new BigNumber(data.tokenRate),
          dayChangePercent: data.tokenRateDayChangePercent,
          dayChangePercentPositive: data.tokenRateDayChangePercentPositive,
        }
      } else {
        tokenImpl.tokenRate = null
      }

      tokenImpl.inited = data.inited
      tokenImpl.tokenState = data.state

      return token
    })
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
    allTokens: Array<FT>,
    principal: Principal,
  ): Promise<Array<FT>> {
    return (
      await Promise.all(
        allTokens.map(async (t) => {
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
    let price = ft
      .map((ft) => ({
        usdBalance: ft.getUSDBalance(),
        usdBalanceDayChange: ft.getUSDBalanceDayChange(),
      }))
      .filter((ft) => ft.usdBalance !== undefined && ft.usdBalance.gt(0))
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
      value: price.usdBalance.toFixed(2),
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
      [Category.Spam]: 8,
      [Category.ChainFusionTestnet]: 7,
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
