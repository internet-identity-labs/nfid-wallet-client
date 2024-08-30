import * as Agent from "@dfinity/agent"
import BigNumber from "bignumber.js"
import { Cache } from "node-ts-cache"

import { integrationCache } from "../../cache"
import { actor } from "./../actors"
import { idlFactory as IDL } from "./idl/ExchangeRate"
import { _SERVICE as Service, ExchangeRate__1 } from "./idl/ExchangeRate.d"
import { idlFactory as IDL_ICRC1_NODE } from "./idl/NodeIndex"
import { _SERVICE as ServiceNode } from "./idl/NodeIndex.d"
import { idlFactory as IDL_TOKEN } from "./idl/Token"
import { _SERVICE as ServiceToken, PublicTokenOverview } from "./idl/Token.d"

const EXCHANGE_RATE_CANISTER = "2ixw4-taaaa-aaaag-qcpdq-cai"
const NODE_CANISTER = "ggzvv-5qaaa-aaaag-qck7a-cai"
type NumberType = string | number | bigint | BigNumber

export class ExchangeRateService {
  private exchangeRateActor: Agent.ActorSubclass<Service>
  private exchangeTokenNodeActor: Agent.ActorSubclass<ServiceNode>
  private ICP2USD: BigNumber = new BigNumber(0)

  constructor() {
    this.exchangeRateActor = actor<Service>(EXCHANGE_RATE_CANISTER, IDL)
    this.exchangeTokenNodeActor = actor<ServiceNode>(
      NODE_CANISTER,
      IDL_ICRC1_NODE,
    )
  }

  getICP2USD(): BigNumber {
    return this.ICP2USD
  }

  async cacheUsdIcpRate() {
    const result = await this.getExchangeRate("f_USD-c_ICP")
    this.ICP2USD = this.parseTokenAmount(result.rate, result.decimals)
  }

  @Cache(integrationCache, { ttl: 300 })
  async usdPriceForICRC1(ledger: string): Promise<BigNumber | undefined> {
    const tokenStorageCanister = await this.getTokenStorageCanister(ledger)
    if (!tokenStorageCanister) {
      return undefined
    }
    const actorStorage = actor<ServiceToken>(tokenStorageCanister, IDL_TOKEN)
    const result: PublicTokenOverview = await actorStorage.getToken(ledger)
    const usdPrice: number = result.priceUSD
    return BigNumber(usdPrice)
  }

  private async getExchangeRate(pair: string): Promise<ExchangeRate__1> {
    return this.exchangeRateActor.get_exchange_rate(pair)
  }
  @Cache(integrationCache, { ttl: 60 * 60 * 24 })
  private async getTokenStorageCanister(
    ledger: string,
  ): Promise<string | undefined> {
    return this.exchangeTokenNodeActor.tokenStorage(ledger).then((result) => {
      return result.length > 0 ? result[0] : undefined
    })
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
