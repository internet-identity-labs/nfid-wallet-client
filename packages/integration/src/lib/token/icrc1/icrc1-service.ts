import {ICRC1 as ICRC1UserData, ICRC1Data, ICRC1Error} from "./types";
import {icrc1RegistryService} from "./icrc1-registry-service";
import {icrc1OracleService} from "./icrc1-oracle-service";
import {State} from "./enums";
import {mapCategory, mapState} from "./util";
import {TokenPrice} from "../../asset/types";
import {PriceService} from "../../asset/asset-util";
import * as Agent from "@dfinity/agent";
import {HttpAgent} from "@dfinity/agent";
import {idlFactory as icrc1IDL} from "../../_ic_api/icrc1";
import {agentBaseConfig} from "@nfid/integration";
import {Principal} from "@dfinity/principal";
import {DEFAULT_ERROR_TEXT, NETWORK} from "@nfid/integration/token/constants";
import {_SERVICE as ICRC1ServiceIDL,} from "../../_ic_api/icrc1.d"
import {idlFactory as icrc1IndexIDL} from "../../_ic_api/index-icrc1";
import {_SERVICE as ICRCIndex} from "../../_ic_api/index-icrc1.d";

export class ICRC1Service {
  async isICRC1Canister(
    canisterId: string,
    rootPrincipalId: string,
    publicKey: string,
    indexCanister: string | undefined,
  ): Promise<ICRC1Data> {
    const actor = Agent.Actor.createActor<ICRC1ServiceIDL>(icrc1IDL, {
      canisterId: canisterId,
      agent: new HttpAgent({...agentBaseConfig}),
    })
    const standards = await actor.icrc1_supported_standards()
    const isICRC1: boolean = standards
      .map((standard) => standard.name)
      .some((name) => name === "ICRC-1")
    if (!isICRC1) {
      throw new ICRC1Error(DEFAULT_ERROR_TEXT)
    }
    await this.getICRC1Canisters(rootPrincipalId).then((icrc1) => {
      if (
        icrc1
          .map((c) => c)
          // .map((c) => c.ledger)
          .find((c) => c.ledger === canisterId && c.index)
      ) {
        throw new ICRC1Error("Canister already added.")
      }
    })

    if (indexCanister) {
      const expectedLedgerId = await this.getLedgerIdFromIndexCanister(indexCanister)
      if (expectedLedgerId.toText() !== canisterId) {
        throw new ICRC1Error("Ledger canister does not match index canister.")
      }
    }

    return this.getICRC1Data([canisterId], publicKey)
      .then((data) => {
        return data[0]
      })
      .catch((e) => {
        console.error(`isICRC1Canister error: ` + e)
        throw new ICRC1Error(DEFAULT_ERROR_TEXT)
      })
  }

  async changeCanisterState(ledger: string, state: State) {
    await icrc1RegistryService.storeICRC1Canister(ledger, state)
  }

  async getICRC1ActiveCanisters(principal: string,): Promise<Array<ICRC1UserData>>  {
    return this.getICRC1Canisters(principal)
      .then((canisters) => {
        return canisters.filter((c) => c.state === State.Active)
      })
  }

  async getICRC1FilteredCanisters(
    principal: string,
    filterText: string,
  ): Promise<Array<ICRC1UserData>> {
    return this.getICRC1Canisters(principal)
      .then((canisters) => {
        return canisters
          .filter((c) =>
            c.name.toLowerCase().includes(filterText.toLowerCase()) ||
            c.symbol.toLowerCase().includes(filterText.toLowerCase())
          );
      });
  }

  async getICRC1Canisters(
    principal: string,
  ): Promise<Array<ICRC1UserData>> {
    const [icrc1StateData, icrc1OracleData] = await Promise.all([
      icrc1RegistryService.getCanistersByRoot(principal),
      icrc1OracleService.getICRC1Canisters()
    ]);

    return icrc1OracleData.map((icrc1) => {
      const registry = icrc1StateData.find((state) => state.ledger === icrc1.ledger)
      //todo maybe group metadata
      const userData: ICRC1UserData = {
        ledger: icrc1.ledger,
        name: icrc1.name,
        symbol: icrc1.symbol,
        logo: icrc1.logo[0],
        index: icrc1.index[0],
        state: registry === undefined ? State.Inactive : mapState(registry.state),
        category: mapCategory(icrc1.category)
      }
      return userData
    })
  }


  async getICRC1Data(
    canisters: Array<string>,
    publicKeyInPrincipal: string,
  ): Promise<Array<ICRC1Data>> {
    const priceList: TokenPrice[] = await new PriceService().getPriceFull()
    return Promise.all(
      canisters.map(async (canisterId) => {
        const actor = Agent.Actor.createActor<ICRC1ServiceIDL>(icrc1IDL, {
          canisterId: canisterId,
          agent: new HttpAgent({...agentBaseConfig}),
        })
        const balance = await actor.icrc1_balance_of({
          subaccount: [],
          owner: Principal.fromText(publicKeyInPrincipal),
        })
        const metadata = await actor.icrc1_metadata()
        let name = ""
        let symbol = ""
        let logo: string | undefined = undefined
        let decimals = 0
        let fee = BigInt(0)

        for (let i = 0; i < metadata.length; i++) {
          const data = metadata[i]
          if (data[0] === "icrc1:name") {
            const val = data[1] as { Text: string }
            name = val.Text
          } else if (data[0] === "icrc1:symbol") {
            const val = data[1] as { Text: string }
            symbol = val.Text
          } else if (data[0] === "icrc1:decimals") {
            const val = data[1] as { Nat: bigint }
            decimals = Number(val.Nat)
          } else if (data[0] === "icrc1:fee") {
            const val = data[1] as { Nat: bigint }
            fee = val.Nat
          } else if (data[0] === "icrc1:logo") {
            const val = data[1] as { Text: string }
            logo = val.Text
          }
        }
        const priceInToken = priceList[symbol as any]

        const priceInUsd = priceInToken
          ? Number((1 / Number(priceInToken)).toFixed(2))
          : undefined

        const balanceNumber = priceInUsd
          ? (Number(balance) / Math.pow(10, Number(decimals))) * priceInUsd
          : undefined

        const feeNumber = priceInUsd
          ? (Number(fee) / Math.pow(10, Number(decimals))) * priceInUsd
          : undefined

        const isListedOnUSD = typeof priceInToken !== "undefined"

        let roundedBalanceNumber: number | undefined = undefined

        if (isListedOnUSD) {
          roundedBalanceNumber =
            balanceNumber === 0 ? 0 : Number(balanceNumber?.toFixed(2))
        }

        return {
          owner: Principal.fromText(publicKeyInPrincipal),
          balance,
          canisterId,
          decimals,
          fee,
          feeInUsd: Number(feeNumber?.toFixed(2)),
          rate: priceInUsd,
          name,
          symbol,
          network: NETWORK,
          priceInUsd: roundedBalanceNumber,
          logo: logo,
        }
      }),
    )
  }

  private getLedgerIdFromIndexCanister(
    indexCanister: string,
  ): Promise<Principal> {
    const indexActor = Agent.Actor.createActor<ICRCIndex>(icrc1IndexIDL, {
      canisterId: indexCanister,
      agent: new HttpAgent({...agentBaseConfig}),
    })
    return indexActor.ledger_id()
  }


}

export const icrc1Service = new ICRC1Service()
