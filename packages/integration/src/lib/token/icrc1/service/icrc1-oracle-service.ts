import { Cache } from "node-ts-cache"

import { integrationCache } from "../../../../cache"
import { ICRC1, ICRC1Request } from "../../../_ic_api/icrc1_oracle.d"
import { iCRC1OracleActor } from "../../../actors"
import { ICRC1 as ICRC1Data } from "../types"

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

  @Cache(integrationCache, { ttl: 60 })
  async getICRC1Canisters(): Promise<ICRC1[]> {
    return await iCRC1OracleActor
      .count_icrc1_canisters()
      .then((canisters) =>
        Promise.all(
          Array.from({ length: Math.ceil(Number(canisters) / 25) }, (_, i) =>
            iCRC1OracleActor.get_icrc1_paginated(i * 25, 25),
          ),
        ).then((res) => res.flat()),
      )
  }
}

export const icrc1OracleService = new ICRC1OracleService()
