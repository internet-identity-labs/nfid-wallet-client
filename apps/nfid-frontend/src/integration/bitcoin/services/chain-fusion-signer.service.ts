import { HttpAgent, SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"

import { actor, agentBaseConfig } from "@nfid/integration"

import { idlFactory as chainFusionSignerIDL } from "../idl/chain-fusion-signer"
import {
  Account,
  _SERVICE as ChainFusionSigner,
  GetAddressRequest,
  PaymentType,
  Result,
} from "../idl/chain-fusion-signer.d"
import { patronService } from "./patron.service"

export class ChainFusionSignerService {
  public async getAddress(identity: SignIdentity): Promise<string> {
    const chaibFusionSignerActor = actor<ChainFusionSigner>(
      CHAIN_FUSION_SIGNER_CANISTER_ID,
      chainFusionSignerIDL,
      {
        agent: HttpAgent.createSync({ ...agentBaseConfig, identity }),
      },
    )

    const request: GetAddressRequest = {
      network: { mainnet: null },
      address_type: { P2WPKH: null },
    }

    await patronService.askToPayFor(identity)

    const patronAccount: Account = {
      owner: Principal.fromText(PATRON_CANISTER_ID),
      subaccount: [],
    }

    const payment: PaymentType = { PatronPaysIcrc2Cycles: patronAccount }

    const result: Result = await chaibFusionSignerActor.btc_caller_address(
      request,
      [payment],
    )

    if ("Err" in result) {
      throw Error("Unable to retrieve the Bitcoin address.")
    }

    return result.Ok.address
  }
}

export const chainFusionSignerService = new ChainFusionSignerService()
