import * as Agent from "@dfinity/agent"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"

import { integrationCache } from "../../cache"
import { actorBuilder } from "./../actors"
import { idlFactory as IDL } from "./idl/ExchangeRate"
import { _SERVICE as Service, ExchangeRate__1 } from "./idl/ExchangeRate.d"
import { idlFactory as IDL_ICRC1_NODE } from "./idl/NodeIndex"
import { _SERVICE as ServiceNode } from "./idl/NodeIndex.d"
import { idlFactory as IDL_TOKEN } from "./idl/Token"
import { _SERVICE as ServiceToken, PublicTokenOverview } from "./idl/Token.d"

const EXCHANGE_RATE_CANISTER = "2ixw4-taaaa-aaaag-qcpdq-cai"
type NumberType = string | number | bigint | BigNumber

export class ExchangeRateService {
  private exchangeRateActor: Agent.ActorSubclass<Service>
  private exchangeTokenNodeActor: Agent.ActorSubclass<ServiceNode>
  private ICP2USD: BigNumber = new BigNumber(0)

  static NODE_CANISTER = "ggzvv-5qaaa-aaaag-qck7a-cai"

  constructor() {
    this.exchangeRateActor = actorBuilder<Service>(EXCHANGE_RATE_CANISTER, IDL)
    this.exchangeTokenNodeActor = actorBuilder<ServiceNode>(
      ExchangeRateService.NODE_CANISTER,
      IDL_ICRC1_NODE,
    )
  }

  getICP2USD(): BigNumber {
    return this.ICP2USD
  }

  getNodeCanister(): string {
    return ExchangeRateService.NODE_CANISTER
  }

  async cacheUsdIcpRate() {
    const result = await this.getExchangeRate("f_USD-c_ICP")
    this.ICP2USD = this.parseTokenAmount(result.rate, result.decimals)
  }

  @Cache(integrationCache, { ttl: 120 })
  async getAllIcpTokens() {
    const responseJson = await fetch("https://web2.icptokens.net/api/tokens")
    if (!responseJson.ok) return undefined
    const tokens: Array<{
      canister_id: string
      metrics: { price: { usd: string }; change: { "24h": { usd: string } } }
    }> = await responseJson.json()
    return tokens.map((el) => ({
      address: el.canister_id,
      price: Number(el.metrics.price.usd),
      priceDayChange: Number(el.metrics.change["24h"].usd),
    }))
  }

  @Cache(integrationCache, { ttl: 120 })
  async usdPriceForICRC1(ledger: string): Promise<{
    value: BigNumber
    dayChangePercent?: string
    dayChangePercentPositive?: boolean
  } | null> {
    try {
      const token = (await this.getAllIcpTokens())?.find(
        (t) => t.address === ledger,
      )

      if (!token) {
        const tokenStorageCanister = await this.getTokenStorageCanister(ledger)
        if (!tokenStorageCanister) {
          return null
        }
        const actorStorage = actorBuilder<ServiceToken>(
          tokenStorageCanister,
          IDL_TOKEN,
        )

        try {
          const result: PublicTokenOverview =
            await actorStorage.getToken(ledger)
          if (result.priceUSD === undefined) return null
          return {
            value: BigNumber(result.priceUSD),
          }
        } catch (e) {
          return null
        }
      }

      return {
        value: BigNumber(token.price),
        dayChangePercent: BigNumber(token.priceDayChange).abs().toFixed(2),
        dayChangePercentPositive: BigNumber(token.priceDayChange).gte(0),
      }
    } catch (e) {
      console.error("usdPriceForICRC1 error: ", e)
      return null
    }
  }

  @Cache(integrationCache, { ttl: 120 })
  async usdPriceForERC20(symbol: string): Promise<{
    value: BigNumber
    dayChangePercent?: string
    dayChangePercentPositive?: boolean
  } | null> {
    try {
      return {
        value: new BigNumber("1"),
        dayChangePercent: "10",
        dayChangePercentPositive: true,
      }
    } catch (e) {
      console.error("usdPriceForERC20 error: ", e)
      return null
    }
  }

  @Cache(integrationCache, { ttl: 60 * 60 * 24 })
  private async getTokenStorageCanister(
    ledger: string,
  ): Promise<string | undefined> {
    return this.exchangeTokenNodeActor.tokenStorage(ledger).then((result) => {
      return result.length > 0 ? result[0] : undefined
    })
  }

  private async getExchangeRate(pair: string): Promise<ExchangeRate__1> {
    return this.exchangeRateActor.get_exchange_rate(pair)
  }

  parseTokenAmount(
    amount: NumberType | null | undefined,
    decimals: number | bigint = 8,
  ): BigNumber {
    if (amount !== 0 && !amount) return new BigNumber(0)

    if (typeof amount === "bigint") amount = Number(amount)

    if (typeof decimals === "bigint") decimals = Number(decimals)

    if (Number.isNaN(Number(amount))) return new BigNumber(String(amount))

    return new BigNumber(String(amount)).dividedBy(10 ** Number(decimals))
  }
}

export const exchangeRateService = new ExchangeRateService()
