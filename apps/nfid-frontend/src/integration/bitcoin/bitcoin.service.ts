import { SignIdentity } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { SelectedUtxosFeeResponse } from "packages/integration/src/lib/_ic_api/icrc1_oracle.d"
import { authStorage } from "packages/integration/src/lib/authentication/storage"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { authState, Balance } from "@nfid/integration"

import { bitcoinCanisterService } from "./services/bitcoin-canister.service"
import {
  Address,
  chainFusionSignerService,
  TransactionId,
} from "./services/chain-fusion-signer.service"
import { ckBtcService } from "./services/ckbtc.service"
import { mempoolService } from "./services/mempool.service"
import { patronService } from "./services/patron.service"
import { satoshiService } from "./services/satoshi.service"

export type BlockIndex = bigint

export type BitcointNetworkFeeAndUtxos = SelectedUtxosFeeResponse

export type BtcToCkBtcFee = {
  conversionFee: bigint
  interNetwokFee: bigint
  bitcointNetworkFee: BitcointNetworkFeeAndUtxos
}

export type CkBtcToBtcFee = {
  conversionFee: bigint
  interNetwokFee: bigint
  bitcointNetworkFee: BitcointNetworkFeeAndUtxos
  identityLabsFee: bigint
}

export class BitcoinService {
  public async getQuickAddress(): Promise<string> {
    let principal = Principal.from(authState.getUserIdData().publicKey)
    const { cachedValue } = await this.getAddressFromCache(principal.toText())

    if (cachedValue == null) {
      let identity = await getWalletDelegation()
      return this.getAddress(identity)
    } else {
      return cachedValue as string
    }
  }

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
  ): Promise<BitcointNetworkFeeAndUtxos> {
    const confirmationResult = await this.ensureWalletConfirmations(identity)
    if (!confirmationResult.ok) {
      throw new Error(confirmationResult.error)
    }
    const amountInSatoshis = satoshiService.getInSatoshis(amount)
    return patronService.askToCalcUtxosAndFee(identity, amountInSatoshis)
  }

  public async getBtcToCkBtcFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<BtcToCkBtcFee> {
    const confirmationResult = await this.ensureWalletConfirmations(identity)
    if (!confirmationResult.ok) {
      throw new Error(confirmationResult.error)
    }

    const interNetwokFee = satoshiService.getInSatoshis("0.000001")
    const amountInSatoshis = satoshiService.getInSatoshis(amount)
    const bitcointNetworkFee: BitcointNetworkFeeAndUtxos =
      await patronService.askToCalcUtxosAndFee(identity, amountInSatoshis)
    return {
      bitcointNetworkFee,
      conversionFee: BigInt(0),
      interNetwokFee,
    }
  }

  public async getCkBtcToBtcFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<CkBtcToBtcFee> {
    return ckBtcService.getCkBtcToBtcFee(identity, amount)
  }

  public async send(
    identity: SignIdentity,
    destinationAddress: string,
    amount: string,
    fee: BitcointNetworkFeeAndUtxos,
  ): Promise<TransactionId> {
    const amountInSatoshis = satoshiService.getInSatoshis(amount)
    const transactionId = await chainFusionSignerService.sendBtc(
      identity,
      destinationAddress,
      amountInSatoshis,
      fee.fee_satoshis,
      fee.utxos,
    )

    const isOnMempool =
      await mempoolService.checkTransactionAppeared(transactionId)

    if (!isOnMempool) {
      throw new Error(
        `Transaction ${transactionId} is not found in mempool. It has not sent successfully.`,
      )
    }

    return transactionId
  }

  public async convertFromCkBtc(
    identity: SignIdentity,
    amount: string,
    fee: CkBtcToBtcFee,
  ): Promise<BlockIndex> {
    const address: string = await this.getAddress(identity)
    const blockIndex: BlockIndex = await ckBtcService.convertCkBtcToBtc(
      identity,
      address,
      amount,
      fee,
    )
    return blockIndex
  }

  public async convertToCkBtc(
    identity: SignIdentity,
    amount: string,
    fee: BtcToCkBtcFee,
  ): Promise<TransactionId> {
    const address: Address =
      await ckBtcService.getBtcAddressToMintCkBtc(identity)
    const txId: TransactionId = await this.send(
      identity,
      address,
      amount,
      fee.bitcointNetworkFee,
    )
    return txId
  }

  private async getAddressFromCache(principal: string) {
    const key = `bitcoin-address-${principal}`
    const cachedValue = await authStorage.get(key)

    return {
      cachedValue,
      key,
    }
  }

  private async ensureWalletConfirmations(
    identity: SignIdentity,
  ): Promise<{ ok: boolean; error?: string }> {
    const { cachedValue } = await this.getAddressFromCache(
      identity.getPrincipal().toText(),
    )
    if (!cachedValue) {
      return {
        ok: false,
        error: "No bitcoin address in cache for fee calculation.",
      }
    }
    const hasConfirmations = await mempoolService.checkWalletConfirmations(
      cachedValue as string,
    )
    if (!hasConfirmations) {
      return {
        ok: false,
        error:
          "Your last BTC transaction is still going through confirmations. Once it hits all six, you will be able to send again.",
      }
    }
    return { ok: true }
  }
}

export const bitcoinService = new BitcoinService()
