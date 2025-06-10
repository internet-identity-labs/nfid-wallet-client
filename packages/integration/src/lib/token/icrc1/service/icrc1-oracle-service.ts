import { HttpAgent, SignIdentity } from "@dfinity/agent"

import { storageWithTtl } from "@nfid/client-db"

import { idlFactory } from "../../../_ic_api/icrc1_oracle"
import {
  BtcSelectUserUtxosFeeResult,
  ICRC1,
  ICRC1Request,
  SelectedUtxosFeeRequest,
  _SERVICE,
} from "../../../_ic_api/icrc1_oracle.d"
import {
  actorBuilder,
  agentBaseConfig,
  iCRC1OracleActor,
} from "../../../actors"
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
    const cache = await storageWithTtl.getEvenExpired(icrc1OracleCacheName)
    if (!cache) {
      const response = await this.requestNetworkForCanisters()
      storageWithTtl.set(
        icrc1OracleCacheName,
        this.serializeCanisters(response),
        60 * 1000,
      )
      return response
    } else if (cache && cache.expired) {
      this.requestNetworkForCanisters().then((response) => {
        storageWithTtl.set(
          icrc1OracleCacheName,
          this.serializeCanisters(response),
          60 * 1000,
        )
      })
      return this.deserializeCanisters(cache.value as string)
    } else {
      return this.deserializeCanisters(cache.value as string)
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

  async btcSelectUserUtxosFee(
    request: SelectedUtxosFeeRequest,
    identity: SignIdentity,
  ): Promise<BtcSelectUserUtxosFeeResult> {
    const actor = actorBuilder<_SERVICE>(ICRC1_ORACLE_CANISTER_ID, idlFactory, {
      agent: HttpAgent.createSync({ ...agentBaseConfig, identity }),
    })
    let response = await actor.btc_select_user_utxos_fee({
      amount_satoshis: request.amount_satoshis,
      min_confirmations: request.min_confirmations,
      network: request.network,
    })
    return response
  }

  async allowSigning(identity: SignIdentity) {
    const actor = actorBuilder<_SERVICE>(ICRC1_ORACLE_CANISTER_ID, idlFactory, {
      agent: HttpAgent.createSync({ ...agentBaseConfig, identity }),
    })
    await actor.allow_signing()
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
          root_canister_id: c.root_canister_id,
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
        root_canister_id: c.root_canister_id,
      }
    })
  }
}

export const icrc1OracleService = new ICRC1OracleService()
