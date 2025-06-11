import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { SelectedUtxosFeeResponse } from "packages/integration/src/lib/_ic_api/icrc1_oracle.d"
import { SelectedUtxosFeeRequest } from "packages/integration/src/lib/_ic_api/icrc1_oracle.d"

import { icrc1OracleService } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { Account, PaymentType } from "../idl/chain-fusion-signer.d"

export class PatronService {
  public async askToPayFor(identity: SignIdentity): Promise<void> {
    await icrc1OracleService.allowSigning(identity)
  }

  public getPaymentType(): PaymentType {
    const patronAccount: Account = {
      owner: Principal.fromText(ICRC1_ORACLE_CANISTER_ID),
      subaccount: [],
    }

    const payment: PaymentType = { PatronPaysIcrc2Cycles: patronAccount }
    return payment
  }

  public async askToCalcUtxosAndFee(
    identity: SignIdentity,
    amountInSatoshis: bigint,
  ): Promise<SelectedUtxosFeeResponse> {
    const request: SelectedUtxosFeeRequest = {
      network: { mainnet: null },
      amount_satoshis: amountInSatoshis,
      min_confirmations: [6],
    }

    const response = await icrc1OracleService.btcSelectUserUtxosFee(
      request,
      identity,
    )

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to calculate transaction fee for BTC.")
    }

    return response.Ok
  }
}

export const patronService = new PatronService()
