import { ActorSubclass, HttpAgent, SignIdentity } from "@dfinity/agent"
import { toNullable } from "@dfinity/utils"

import { actor, agentBaseConfig } from "@nfid/integration"

import { idlFactory as chainFusionSignerIDL } from "../idl/chain-fusion-signer"
import {
  _SERVICE as ChainFusionSigner,
  EthAddressRequest,
  EthSignTransactionRequest,
  GetAddressRequest,
  GetBalanceRequest,
  PaymentType,
  Result,
  SendBtcRequest,
  Utxo,
} from "../idl/chain-fusion-signer.d"

import { patronService } from "./patron.service"

export type TransactionId = string
export type Balance = bigint
export type Address = string

export class ChainFusionSignerService {
  public async getAddress(identity: SignIdentity): Promise<Address> {
    const chainFusionSignerActor = this.getChainFusionSignerActor(identity)

    const request: GetAddressRequest = {
      network: { mainnet: null },
      address_type: { P2WPKH: null },
    }

    const paymentType: PaymentType = patronService.getPaymentType()

    const response: Result = await chainFusionSignerActor.btc_caller_address(
      request,
      [paymentType],
    )

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to retrieve Bitcoin address.")
    }

    return response.Ok.address
  }

  public async getEthAddress(identity: SignIdentity): Promise<Address> {
    const chainFusionSignerActor = this.getChainFusionSignerActor(identity)

    const request: EthAddressRequest = { principal: [] }

    const paymentType: PaymentType = patronService.getPaymentType()

    const response = await chainFusionSignerActor.eth_address(request, [
      paymentType,
    ])

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to retrieve Ethereum address.")
    }

    return response.Ok.address
  }

  public async ethSignTransaction(
    identity: SignIdentity,
    transaction: EthSignTransactionRequest,
  ): Promise<string> {
    const chainFusionSignerActor = this.getChainFusionSignerActor(identity)
    const response = await chainFusionSignerActor.eth_sign_transaction(
      transaction,
      [patronService.getPaymentType()],
    )

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to sign transaction.")
    }

    return response.Ok.signature
  }

  public async getBalance(
    identity: SignIdentity,
    minConfirmations?: number,
  ): Promise<Balance> {
    const chainFusionSignerActor = this.getChainFusionSignerActor(identity)

    const request: GetBalanceRequest = {
      network: { mainnet: null },
      address_type: { P2WPKH: null },
      min_confirmations: toNullable(minConfirmations),
    }

    const paymentType: PaymentType = patronService.getPaymentType()

    const response = await chainFusionSignerActor.btc_caller_balance(request, [
      paymentType,
    ])

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to retrieve balance.")
    }

    return response.Ok.balance
  }

  public async sendBtc(
    identity: SignIdentity,
    destinationAddress: string,
    satoshisAmount: bigint,
    satoshisFee: bigint,
    utxosToSpend: Array<Utxo>,
  ): Promise<TransactionId> {
    const chainFusionSignerActor = this.getChainFusionSignerActor(identity)
    const paymentType: PaymentType = patronService.getPaymentType()

    const request: SendBtcRequest = {
      network: { mainnet: null },
      address_type: { P2WPKH: null },
      fee_satoshis: [satoshisFee],
      utxos_to_spend: utxosToSpend,
      outputs: [
        {
          destination_address: destinationAddress,
          sent_satoshis: satoshisAmount,
        },
      ],
    }

    const response = await chainFusionSignerActor.btc_caller_send(request, [
      paymentType,
    ])

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to send BTC.")
    }

    return response.Ok.txid
  }

  public async ethPersonalSign(
    identity: SignIdentity,
    message: string,
  ): Promise<string> {
    const chainFusionSignerActor = this.getChainFusionSignerActor(identity)
    const response = await chainFusionSignerActor.eth_personal_sign(
      { message },
      [patronService.getPaymentType()],
    )

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to sign personal message.")
    }

    return response.Ok.signature
  }

  public async ethSignPrehash(
    identity: SignIdentity,
    hash: string,
  ): Promise<string> {
    const chainFusionSignerActor = this.getChainFusionSignerActor(identity)
    const response = await chainFusionSignerActor.eth_sign_prehash({ hash }, [
      patronService.getPaymentType(),
    ])

    if ("Err" in response) {
      console.error(response)
      throw Error("Unable to sign prehash.")
    }

    return response.Ok.signature
  }

  private getChainFusionSignerActor(
    identity: SignIdentity,
  ): ActorSubclass<ChainFusionSigner> {
    console.log(
      "CHAIN_FUSION_SIGNER_CANISTER_ID",
      CHAIN_FUSION_SIGNER_CANISTER_ID,
    )
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
