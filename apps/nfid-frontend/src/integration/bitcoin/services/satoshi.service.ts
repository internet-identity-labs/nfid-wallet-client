const BTC_DECIMALS = 8

export class SatoshiService {
  public getInSatoshis(amount: string): bigint {
    return BigInt((Number(amount) * 10 ** BTC_DECIMALS).toFixed(0))
  }
}

export const satoshiService = new SatoshiService()
