import * as Agent from "@dfinity/agent"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"

import { integrationCache } from "../../cache"
import { actorBuilder } from "./../actors"
import { idlFactory as IDL } from "./idl/ExchangeRate"
import { _SERVICE as Service, ExchangeRate__1 } from "./idl/ExchangeRate.d"
import { idlFactory as IDL_ICRC1_NODE } from "./idl/NodeIndex"
import { _SERVICE as ServiceNode } from "./idl/NodeIndex.d"

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
  async getAllIcpSwapTokens() {
    return (await this.exchangeTokenNodeActor.getAllTokens()).map((el) => ({
      address: el.address,
      price: el.priceUSD,
      priceDayChange: el.priceUSDChange,
    }))
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
  async usdPriceForICRC1(
    ledger: string,
  ): Promise<
    | {
        value: BigNumber
        dayChangePercent: string
        dayChangePercentPositive: boolean
      }
    | undefined
  > {
    let token = (await this.getAllIcpTokens())?.find(
      (t) => t.address === ledger,
    )

    if (!token)
      token = (await this.getAllIcpSwapTokens())?.find(
        (t) => t.address === ledger,
      )

    if (!token) return

    return {
      value: BigNumber(token.price),
      dayChangePercent: BigNumber(token.priceDayChange).abs().toFixed(2),
      dayChangePercentPositive: BigNumber(token.priceDayChange).gte(0),
    }
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
