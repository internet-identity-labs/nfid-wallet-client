import { Principal } from "@dfinity/principal"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"
import { integrationCache } from "packages/integration/src/cache"
import BtcIcon from "packages/ui/src/organisms/tokens/assets/bitcoin.png"
import { FT } from "src/integration/ft/ft"
import { FTImpl } from "src/integration/ft/impl/ft-impl"
import { nftService } from "src/integration/nft/nft-service"

import {
  CKBTC_CANISTER_ID,
  ICP_CANISTER_ID,
  NFIDW_CANISTER_ID,
} from "@nfid/integration/token/constants"
import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"
import { icrc1StorageService } from "@nfid/integration/token/icrc1/service/icrc1-storage-service"

import { ShroffIcpSwapImpl } from "../swap/icpswap/impl/shroff-icp-swap-impl"
import { KongSwapShroffImpl } from "../swap/kong/impl/kong-swap-shroff"

export interface TokensAvailableToSwap {
  to: string[]
  from: string[]
}

const TOKENS_TO_REORDER: {
  canisterId: string
  index: number
  ft?: FT | null
}[] = [
  { canisterId: "btc-native", index: 1 },
  { canisterId: NFIDW_CANISTER_ID, index: 2 },
  { canisterId: CKBTC_CANISTER_ID, index: 3 },
]

export class FtService {
  async getTokens(userId: string): Promise<Array<FT>> {
    return icrc1StorageService
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

        await Promise.all(updatePromises)

        if (updatePromises.length > 0) {
          canisters = await icrc1StorageService.getICRC1Canisters(userId)
        }

        const ft = canisters.map((canister) => new FTImpl(canister))

        ft.push(this.getNativeBtcToken())
        return this.sortTokens(ft)
      })
  }

  private getNativeBtcToken(): FTImpl {
    return new FTImpl({
      ledger: "btc-native",
      symbol: "BTC",
      name: "Bitcoin",
      decimals: 8,
      category: Category.Native,
      logo: BtcIcon,
      state: State.Active,
      fee: BigInt(0),
      index: undefined,
      rootCanisterId: undefined,
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

  //todo move somewhere because contains NFT balance as well
  async getTotalUSDBalance(
    userPublicKey: Principal,
    ft: FT[],
  ): Promise<
    | {
        value: string
        dayChangePercent?: string
        dayChange?: string
        dayChangePositive?: boolean
      }
    | undefined
  > {
    let nftPrice = 0
    try {
      nftPrice = await nftService.getNFTsTotalPrice(userPublicKey)
    } catch (e) {}

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
      value: price.usdBalance!.plus(nftPrice).toFixed(2),
      dayChangePercent: price.usdBalance.eq(0)
        ? "0.00"
        : BigNumber(price.usdBalanceDayChange!)
            .div(price.usdBalance!)
            .multipliedBy(100)
            .abs()
            .toFixed(2),
      dayChange: BigNumber(price.usdBalanceDayChange!).toFixed(2),
      dayChangePositive: price.usdBalanceDayChange!.gte(0),
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
      [Category.Community]: 5,
      [Category.Spam]: 7,
      [Category.ChainFusionTestnet]: 6,
    }

    TOKENS_TO_REORDER.forEach((token) => {
      const index = tokens.findIndex(
        (t) => t.getTokenAddress() === token.canisterId,
      )
      if (index !== -1) {
        token.ft = tokens.splice(index, 1)[0]
      }
    })

    tokens.sort((a, b) => {
      const aCategory =
        categoryOrder[a.getTokenCategory()] || Number.MAX_SAFE_INTEGER
      const bCategory =
        categoryOrder[b.getTokenCategory()] || Number.MAX_SAFE_INTEGER
      return aCategory - bCategory
    })

    TOKENS_TO_REORDER.forEach((specific) => {
      if (specific.ft) {
        tokens.splice(specific.index, 0, specific.ft)
      }
    })

    return tokens
  }
}

export const ftService = new FtService()
