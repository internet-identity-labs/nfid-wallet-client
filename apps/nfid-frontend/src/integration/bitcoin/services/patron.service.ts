import { ActorSubclass, HttpAgent, SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { actor, agentBaseConfig } from "@nfid/integration"

import { Account, PaymentType } from "../idl/chain-fusion-signer.d"
import { idlFactory as patronIDL } from "../idl/patron"
import {
  _SERVICE as Patron,
  SelectedUtxosFeeRequest,
  SelectedUtxosFeeResponse,
} from "../idl/patron.d"
import { satoshiService } from "./satoshi.service"

export class PatronService {
  public async askToPayFor(identity: SignIdentity): Promise<void> {
    const patronActor = this.getPatronActor(identity)
    await patronActor.allow_signing([])
  }

  public getPaymentType(): PaymentType {
    const patronAccount: Account = {
      owner: Principal.fromText(PATRON_CANISTER_ID),
      subaccount: [],
    }

    const payment: PaymentType = { PatronPaysIcrc2Cycles: patronAccount }
    return payment
  }

  public async askToCalcUtxosAndFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<SelectedUtxosFeeResponse> {
    const patronActor = this.getPatronActor(identity)
    const amountInSatoshis = satoshiService.getInSatoshis(amount)

    const request: SelectedUtxosFeeRequest = {
      network: { mainnet: null },
      amount_satoshis: amountInSatoshis,
      min_confirmations: [6],
    }

    const response = await patronActor.btc_select_user_utxos_fee(request)

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to calculate transaction fee for BTC.")
    }

    return response.Ok
  }

  private getPatronActor(identity: SignIdentity): ActorSubclass<Patron> {
    return actor<Patron>(PATRON_CANISTER_ID, patronIDL, {
      agent: HttpAgent.createSync({ ...agentBaseConfig, identity }),
    })
  }
}

export const patronService = new PatronService()
