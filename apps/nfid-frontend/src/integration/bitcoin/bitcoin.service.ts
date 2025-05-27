import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

import { Balance } from "@nfid/integration"

import { SelectedUtxosFeeResponse } from "./idl/patron.d"
import {
  Address,
  chainFusionSignerService,
  TransactionId,
} from "./services/chain-fusion-signer.service"
import { patronService } from "./services/patron.service"
import { satoshiService } from "./services/satoshi.service"

export class BitcoinService {
  public async getAddress(identity: SignIdentity): Promise<Address> {
    const principal: string = identity.getPrincipal().toText()
    const key = `bitcoin-address-${principal}`
    const cachedValue = await authStorage.get(key)

    if (cachedValue != null) {
      return cachedValue as string
    }

    await patronService.askToPayFor(identity)
    const address: string = await chainFusionSignerService.getAddress(identity)
    await authStorage.set(key, address)
    return address
  }

  public async getBalance(
    identity: SignIdentity,
    minConfirmations?: number,
  ): Promise<Balance> {
    await patronService.askToPayFor(identity)
    return chainFusionSignerService.getBalance(identity, minConfirmations)
  }

  public async getQuickBalance(globalPrincipal: Principal): Promise<Balance> {
    //TODO: implement quick balance
    globalPrincipal.toText()
    return BigInt(0)
  }

  public async getFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<SelectedUtxosFeeResponse> {
    return patronService.askToCalcUtxosAndFee(identity, amount)
  }

  public async send(
    identity: SignIdentity,
    destinationAddress: string,
    amount: string,
    fee: SelectedUtxosFeeResponse,
  ): Promise<TransactionId> {
    const amountInSatoshis = satoshiService.getInSatoshis(amount)
    return chainFusionSignerService.sendBtc(
      identity,
      destinationAddress,
      amountInSatoshis,
      fee.fee_satoshis,
      fee.utxos,
    )
  }
}

export const bitcoinService = new BitcoinService()
