import { ICRC1, ICRC1Request } from "../../../_ic_api/icrc1_oracle.d"
import { iCRC1OracleActor } from "../../../actors"
import { localStorageTTL } from "../../../util/local-strage-ttl"
import { ICRC1 as ICRC1Data } from "../types"

export const icrc1OracleCacheName = "ICRC1OracleService.getICRC1Canisters"

export class ICRC1OracleService {
  async addICRC1Canister(data: ICRC1Data): Promise<void> {
    const request: ICRC1Request = {
      logo: data.logo === undefined ? [] : [data.logo],
      name: data.name,
      ledger: data.ledger,
      index: data.index === undefined ? [] : [data.index],
      symbol: data.symbol,
      fee: BigInt(data.fee),
      decimals: data.decimals,
    }
    await iCRC1OracleActor.store_icrc1_canister(request)
  }

  async getICRC1Canisters(): Promise<ICRC1[]> {
    const cache = localStorageTTL.getEvenExpiredItem(icrc1OracleCacheName)
    if (!cache) {
      const response = await this.requestNetworkForCanisters()
      localStorageTTL.setItem(
        icrc1OracleCacheName,
        JSON.stringify(response),
        60,
      )
      return response
    } else if (cache && cache.expired) {
      this.requestNetworkForCanisters().then((response) => {
        localStorageTTL.setItem(
          icrc1OracleCacheName,
          JSON.stringify(response),
          60,
        )
      })
      return JSON.parse(cache.object, (key, value) => {
        if (key === "fee") {
          return BigInt(value.toString().slice(0, -1))
        }
        return value
      })
    } else {
      return JSON.parse(cache.object, (key, value) => {
        if (key === "fee") {
          return BigInt(value.toString().slice(0, -1))
        }
        return value
      })
    }
  }

  async requestNetworkForCanisters() {
    return await iCRC1OracleActor.count_icrc1_canisters().then((canisters) => {
      return Promise.all(
        Array.from({ length: Math.ceil(Number(canisters) / 25) }, (_, i) =>
          iCRC1OracleActor.get_icrc1_paginated(i * 25, 25),
        ),
      ).then((res) => res.flat())
    })
  }
}

export const icrc1OracleService = new ICRC1OracleService()
