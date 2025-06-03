import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { authStorage } from "packages/integration/src/lib/authentication/storage"

import { Balance } from "@nfid/integration"

import { SelectedUtxosFeeResponse } from "./idl/patron.d"
import { bitcoinCanisterService } from "./services/bitcoin-canister.service"
import {
  Address,
  chainFusionSignerService,
  TransactionId,
} from "./services/chain-fusion-signer.service"
import { ckBtcService } from "./services/ckbtc.service"
import { patronService } from "./services/patron.service"
import { satoshiService } from "./services/satoshi.service"

export type BlockIndex = bigint

export class BitcoinService {
  public async getAddress(identity: SignIdentity): Promise<Address> {
    const { cachedValue, key } = await this.getAddressFromCache(
      identity.getPrincipal().toText(),
    )

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
    await this.getAddress(identity)
    return chainFusionSignerService.getBalance(identity, minConfirmations)
  }

  private async getAddressFromCache(principal: string) {
    const key = `bitcoin-address-${principal}`
    const cachedValue = await authStorage.get(key)

    return {
      cachedValue,
      key,
    }
  }

  public async getQuickBalance(principal: Principal): Promise<bigint> {
    const { cachedValue } = await this.getAddressFromCache(principal.toText())

    if (!cachedValue) {
      throw Error("No bitcoin address in a cache.")
    }

    return bitcoinCanisterService.getBalanceQuery(cachedValue as string)
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

  public async convertFromCkBtc(
    identity: SignIdentity,
    amount: string,
  ): Promise<BlockIndex> {
    const address: string = await this.getAddress(identity)
    const blockIndex: BlockIndex = await ckBtcService.convertCkBtcToBtc(
      identity,
      address,
      amount,
    )
    return blockIndex
  }

  public async convertToCkBtc(
    identity: SignIdentity,
    amount: string,
    fee: SelectedUtxosFeeResponse,
  ): Promise<TransactionId> {
    const address: Address = await ckBtcService.getBtcAddressToMintCkBtc(identity)
    const txId: TransactionId = await this.send(identity, address, amount, fee)
    return txId
  }
}

export const bitcoinService = new BitcoinService()
