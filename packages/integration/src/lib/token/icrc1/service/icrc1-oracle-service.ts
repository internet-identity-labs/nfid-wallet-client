import { ICRC1, ICRC1Request } from "../../../_ic_api/icrc1_oracle.d"
import { iCRC1OracleActor } from "../../../actors"
import { idbStorageTTL } from "../../../util/idb-strage-ttl"
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
    const cache = await idbStorageTTL.getEvenExpiredItem(icrc1OracleCacheName)
    if (!cache) {
      const response = await this.requestNetworkForCanisters()
      await idbStorageTTL.setItem(
        icrc1OracleCacheName,
        this.serializeCanisters(response),
        60,
      )
      return response
    } else if (cache && cache.expired) {
      const response = await this.requestNetworkForCanisters()
      await idbStorageTTL.setItem(
        icrc1OracleCacheName,
        this.serializeCanisters(response),
        60,
      )
      return this.deserializeCanisters(cache.object)
    } else {
      return this.deserializeCanisters(cache.object)
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

  serializeCanisters(canister: Array<ICRC1>): string {
    return JSON.stringify(
      canister.map((c) => {
        return {
          name: c.name,
          ledger: c.ledger,
          category: c.category,
          index: c.index,
          symbol: c.symbol,
          logo: c.logo,
          fee: Number(c.fee),
          decimals: c.decimals,
        }
      }),
    )
  }

  deserializeCanisters(canister: string): Array<ICRC1> {
    return (JSON.parse(canister) as Array<any>).map((c) => {
      return {
        name: c.name,
        ledger: c.ledger,
        category: c.category,
        index: c.index,
        symbol: c.symbol,
        logo: c.logo,
        fee: BigInt(c.fee),
        decimals: c.decimals,
      }
    })
  }
}

export const icrc1OracleService = new ICRC1OracleService()
