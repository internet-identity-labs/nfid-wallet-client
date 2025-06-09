import { ActorSubclass, HttpAgent, SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { actor, agentBaseConfig } from "@nfid/integration"
import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { Account, PaymentType } from "../idl/chain-fusion-signer.d"
import { idlFactory as patronIDL } from "../idl/patron"
import {
  _SERVICE as Patron,
  SelectedUtxosFeeRequest,
  SelectedUtxosFeeResponse,
} from "../idl/patron.d"

export class PatronService {
  public async askToPayFor(identity: SignIdentity): Promise<void> {
    await icrc1OracleService.allowSigning(identity)
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
    amountInSatoshis: bigint,
  ): Promise<SelectedUtxosFeeResponse> {
    const patronActor = this.getPatronActor(identity)

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
