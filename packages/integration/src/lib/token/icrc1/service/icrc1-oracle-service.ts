import { HttpAgent, SignIdentity } from "@dfinity/agent"

import { ttlCacheService } from "@nfid/client-db"

import { idlFactory } from "../../../_ic_api/icrc1_oracle"
import {
  BtcSelectUserUtxosFeeResult,
  DiscoveryApp,
  DiscoveryVisitRequest,
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
import {
  DiscoveryAppData,
  DiscoveryAppStatus,
  DiscoveryVisitData,
  ICRC1 as ICRC1Data,
} from "../types"

export const ICRC1_ORACLE_CACHE_NAME = "ICRC1OracleService.getICRC1Canisters"

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

  async getAllNeurons(): Promise<
    Array<{
      name: string
      date_added: bigint
      rootCanister: string
      neuron_id: string
    }>
  > {
    return await iCRC1OracleActor.get_all_neurons().then((neurons) => {
      return neurons.map((n) => {
        return {
          name: n.name,
          date_added: n.date_added,
          rootCanister: n.ledger,
          neuron_id: n.neuron_id,
        }
      })
    })
  }

  async getICRC1Canisters(): Promise<ICRC1[]> {
    return ttlCacheService.getOrFetch(
      ICRC1_ORACLE_CACHE_NAME,
      () => this.requestNetworkForCanisters(),
      60 * 1000,
      {
        serialize: (v) => this.serializeCanisters(v),
        deserialize: (v) => this.deserializeCanisters(v as string),
      },
    )
  }

  async requestNetworkForCanisters() {
    return await iCRC1OracleActor.count_icrc1_canisters().then((canisters) => {
      return Promise.all(
        Array.from({ length: Math.ceil(Number(canisters) / 25) }, (_, i) =>
          iCRC1OracleActor.get_icrc1_paginated(BigInt(i * 25), BigInt(25)),
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
    const response = await actor.btc_select_user_utxos_fee({
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

  async storeDiscoveryApp(data: DiscoveryVisitData): Promise<void> {
    const request: DiscoveryVisitRequest = {
      derivation_origin:
        data.derivationOrigin !== undefined ? [data.derivationOrigin] : [],
      hostname: data.hostname,
      login: data.login === "Global" ? { Global: null } : { Anonymous: null },
    }
    const unique = await iCRC1OracleActor.is_unique(request)
    if (!unique) return

    await iCRC1OracleActor.store_discovery_app(request)
  }

  async isUnique(data: DiscoveryVisitData): Promise<boolean> {
    const request: DiscoveryVisitRequest = {
      derivation_origin:
        data.derivationOrigin !== undefined ? [data.derivationOrigin] : [],
      hostname: data.hostname,
      login: data.login === "Global" ? { Global: null } : { Anonymous: null },
    }
    return await iCRC1OracleActor.is_unique(request)
  }

  async getDiscoveryAppPaginated(
    offset: bigint,
    limit: bigint,
  ): Promise<DiscoveryAppData[]> {
    const apps = await iCRC1OracleActor.get_discovery_app_paginated(
      offset,
      limit,
    )
    return apps.map(this.mapDiscoveryApp)
  }

  private mapDiscoveryApp(app: DiscoveryApp): DiscoveryAppData {
    const statusKey = Object.keys(app.status)[0] as DiscoveryAppStatus
    return {
      id: app.id,
      derivationOrigin: app.derivation_origin[0],
      hostname: app.hostname,
      url: app.url[0],
      name: app.name[0],
      image: app.image[0],
      desc: app.desc[0],
      isGlobal: app.is_global,
      isAnonymous: app.is_anonymous,
      uniqueUsers: app.unique_users,
      status: statusKey,
    }
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
        date_added: c.date_added,
      }
    })
  }
}

export const icrc1OracleService = new ICRC1OracleService()
