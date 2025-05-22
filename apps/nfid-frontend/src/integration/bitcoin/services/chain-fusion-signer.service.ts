import { ActorSubclass, HttpAgent, SignIdentity } from "@dfinity/agent"
import { toNullable } from "@dfinity/utils"

import { actor, agentBaseConfig } from "@nfid/integration"

import { idlFactory as chainFusionSignerIDL } from "../idl/chain-fusion-signer"
import {
  _SERVICE as ChainFusionSigner,
  GetAddressRequest,
  GetBalanceRequest,
  PaymentType,
  Result,
} from "../idl/chain-fusion-signer.d"
import { patronService } from "./patron.service"

export class ChainFusionSignerService {
  public async getAddress(identity: SignIdentity): Promise<string> {
    const chaibFusionSignerActor = this.getcCaibFusionSignerActor(identity)

    const request: GetAddressRequest = {
      network: { mainnet: null },
      address_type: { P2WPKH: null },
    }

    const paymentType: PaymentType = patronService.getPaymentType()

    const response: Result = await chaibFusionSignerActor.btc_caller_address(
      request,
      [paymentType],
    )

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to retrieve Bitcoin address.")
    }

    return response.Ok.address
  }

  public async getBalance(
    identity: SignIdentity,
    minConfirmations?: number,
  ): Promise<bigint> {
    const chaibFusionSignerActor = this.getcCaibFusionSignerActor(identity)

    const request: GetBalanceRequest = {
      network: { mainnet: null },
      address_type: { P2WPKH: null },
      min_confirmations: toNullable(minConfirmations),
    }

    const paymentType: PaymentType = patronService.getPaymentType()

    const response = await chaibFusionSignerActor.btc_caller_balance(request, [
      paymentType,
    ])

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to retrieve balance.")
    }

    return response.Ok.balance
  }

  private getcCaibFusionSignerActor(
    identity: SignIdentity,
  ): ActorSubclass<ChainFusionSigner> {
    return actor<ChainFusionSigner>(
      CHAIN_FUSION_SIGNER_CANISTER_ID,
      chainFusionSignerIDL,
      {
        agent: HttpAgent.createSync({ ...agentBaseConfig, identity }),
      },
    )
  }
}

export const chainFusionSignerService = new ChainFusionSignerService()
