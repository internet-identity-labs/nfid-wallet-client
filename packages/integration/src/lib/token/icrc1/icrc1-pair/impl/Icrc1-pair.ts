import * as Agent from "@dfinity/agent"
import { HttpAgent, SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import {
  actorBuilder,
  agentBaseConfig,
  hasOwnProperty,
} from "@nfid/integration"
import { IIcrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/i-icrc-pair"
import { icrc1RegistryService } from "@nfid/integration/token/icrc1/service/icrc1-registry-service"

import { idlFactory as icrc1IDL } from "../../../../_ic_api/icrc1"
import { _SERVICE as ICRC1ServiceIDL } from "../../../../_ic_api/icrc1.d"
import { idlFactory as icrc1IndexIDL } from "../../../../_ic_api/index-icrc1"
import { _SERVICE as ICRCIndex } from "../../../../_ic_api/index-icrc1.d"
import { Category, State } from "../../enum/enums"
import { icrc1OracleService } from "../../service/icrc1-oracle-service"
import { icrc1StorageService } from "../../service/icrc1-storage-service"
import { ICRC1Data, ICRC1Error, AllowanceDetailDTO } from "../../types"
import { principalToAccountIdentifier } from "@dfinity/ledger-icp"
export class Icrc1Pair implements IIcrc1Pair {
  private readonly ledger: string
  private readonly index: string | undefined

  constructor(ledger: string, index: string | undefined) {
    this.ledger = ledger
    this.index = index
  }

  async validateStandard() {
    const actor = Agent.Actor.createActor<ICRC1ServiceIDL>(icrc1IDL, {
      canisterId: this.ledger,
      agent: new HttpAgent({ ...agentBaseConfig }),
    })
    try {
      const standards = await actor.icrc1_supported_standards()
      const isICRC1: boolean = standards
        .map((standard) => standard.name)
        .some((name) => name === "ICRC-1")
      if (!isICRC1) {
        throw new ICRC1Error(
          "This does not appear to be an ICRC-1 compatible ledger canister.",
        )
      }
    } catch (e) {
      throw new ICRC1Error(
        "This does not appear to be an ICRC-1 compatible ledger canister.",
      )
    }
  }

  async validateIfExists(rootPrincipalId: string) {
    await icrc1StorageService
      .getICRC1Canisters(rootPrincipalId)
      .then((icrc1) => {
        if (
          icrc1.map((c) => c).find((c) => c.ledger === this.ledger && c.index)
        ) {
          throw new ICRC1Error("Canister already added.")
        }
      })
      .catch((e) => {
        if (e instanceof ICRC1Error) {
          throw e
        }
        throw new ICRC1Error(
          "This does not appear to be an ICRC-1 compatible ledger canister.",
        )
      })
  }

  async validateIndexCanister() {
    if (this.index) {
      try {
        const expectedLedgerId = await this.getLedgerIdFromIndexCanister(
          this.index,
        )
        if (expectedLedgerId.toText() !== this.ledger) {
          throw new ICRC1Error("Ledger canister does not match index canister.")
        }
      } catch (e) {
        if (e instanceof ICRC1Error) {
          throw e
        }
        throw new ICRC1Error(
          "This does not appear to be an ICRC-1 compatible index canister.",
        )
      }
    }
  }

  async getICRC1Data(publicKey: string): Promise<ICRC1Data> {
    const [metadata, balance] = await Promise.all([
      this.getMetadata(),
      this.getBalance(publicKey),
    ])

    return {
      owner: Principal.fromText(publicKey),
      balance,
      canisterId: this.ledger,
      ...metadata,
    }
  }

  async getIcrc2Allowances(
    rootPrincipalId: Principal,
  ): Promise<Array<AllowanceDetailDTO>> {
    const actor = Agent.Actor.createActor<ICRC1ServiceIDL>(icrc1IDL, {
      canisterId: this.ledger,
      agent: new HttpAgent({ ...agentBaseConfig }),
    })
    if (this.ledger === "ryjl3-tyaaa-aaaaa-aaaba-cai") {
      const allowances = await actor.get_allowances({
        from_account_id: principalToAccountIdentifier(rootPrincipalId),
        prev_spender_id: [],
        take: [],
      })
      return allowances.map((allowance) => ({
        from_account: allowance.from_account_id,
        to_spender: allowance.to_spender_id,
        allowance: allowance.allowance.e8s,
        expires_at: allowance.expires_at ? allowance.expires_at[0] : undefined,
      }))
    }
    try {
      const allowances = await actor.icrc103_get_allowances({
        from_account: [
          {
            owner: rootPrincipalId,
            subaccount: [],
          },
        ],
        take: [],
        prev_spender: [],
      })
      if (hasOwnProperty(allowances, "Err")) {
        console.debug(
          "Failed to get allowances {} for token {}:",
          JSON.stringify(allowances.Err),
          this.ledger,
        )
        return []
      }
      return allowances.Ok.map((allowance) => ({
        from_account: allowance.from_account.owner.toText(),
        to_spender: allowance.to_spender.owner.toText(),
        allowance: allowance.allowance,
        expires_at:
          allowance.expires_at.length > 0 ? allowance.expires_at[0] : undefined,
      }))
    } catch (e) {
      console.debug("Failed to get allowances {} for token {}:", e, this.ledger)
      return []
    }
  }

  async setAllowance(
    signIdentity: SignIdentity,
    spenderPrincipalId: Principal,
    amount: bigint,
  ): Promise<bigint> {
    const actor = actorBuilder<ICRC1ServiceIDL>(this.ledger, icrc1IDL, {
      canisterId: this.ledger,
      agent: new HttpAgent({ ...agentBaseConfig, identity: signIdentity }),
    })
    let result = await actor.icrc2_approve({
      spender: {
        owner: spenderPrincipalId,
        subaccount: [],
      },
      amount,
      expires_at: [],
      created_at_time: [],
      expected_allowance: [],
      fee: [],
      memo: [],
      from_subaccount: [],
    })
    if (hasOwnProperty(result, "Err")) {
      throw new ICRC1Error(
        `Failed to set allowance. ${JSON.stringify(result.Err)} for token ${this.ledger}`,
      )
    }
    return result.Ok
  }

  async storeSelf() {
    const metadata = await this.getMetadata()
    await Promise.all([
      icrc1OracleService.addICRC1Canister({
        ledger: this.ledger,
        index: this.index,
        name: metadata.name,
        symbol: metadata.symbol,
        logo: metadata.logo,
        state: State.Active,
        category: Category.Spam,
        fee: metadata.fee,
        decimals: metadata.decimals,
        rootCanisterId: undefined,
      }),
      icrc1RegistryService.storeICRC1Canister(this.ledger, State.Active),
    ])
  }

  async getBalance(principal: string): Promise<bigint> {
    const actor = Agent.Actor.createActor<ICRC1ServiceIDL>(icrc1IDL, {
      canisterId: this.ledger,
      agent: new HttpAgent({ ...agentBaseConfig }),
    })
    return await actor.icrc1_balance_of({
      subaccount: [],
      owner: Principal.fromText(principal),
    })
  }

  async getMetadata() {
    const actor = Agent.Actor.createActor<ICRC1ServiceIDL>(icrc1IDL, {
      canisterId: this.ledger,
      agent: new HttpAgent({ ...agentBaseConfig }),
    })
    const metadata = await actor.icrc1_metadata()
    let name = ""
    let symbol = ""
    let logo: string | undefined = undefined
    let decimals = 0
    let fee = BigInt(0)

    //TODO one day
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

    return {
      name,
      symbol,
      logo,
      decimals,
      fee,
      canister: this.ledger,
    }
  }

  private getLedgerIdFromIndexCanister(
    indexCanister: string,
  ): Promise<Principal> {
    const indexActor = Agent.Actor.createActor<ICRCIndex>(icrc1IndexIDL, {
      canisterId: indexCanister,
      agent: new HttpAgent({ ...agentBaseConfig }),
    })
    return indexActor.ledger_id()
  }
}
