import * as Agent from "@dfinity/agent"
import BigNumber from "bignumber.js"

import { actor } from "./../actors"
import { idlFactory as IDL } from "./idl/ExchangeRate"
import { _SERVICE as Service, ExchangeRate__1 } from "./idl/ExchangeRate.d"

const EXCHANGE_RATE_CANISTER = "2ixw4-taaaa-aaaag-qcpdq-cai"
type NumberType = string | number | bigint | BigNumber

export class ExchangeRateService {
  private exchangeRateActor: Agent.ActorSubclass<Service>
  private ICP2USD: BigNumber = new BigNumber(0)

  constructor() {
    this.exchangeRateActor = actor<Service>(EXCHANGE_RATE_CANISTER, IDL)
  }

  getICP2USD(): BigNumber {
    return this.ICP2USD
  }

  async cacheUsdIcpRate() {
    const result = await this.getExchangeRate("f_USD-c_ICP")
    this.ICP2USD = this.parseTokenAmount(result.rate, result.decimals)
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
