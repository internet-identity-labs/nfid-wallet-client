import { SignIdentity } from "@dfinity/agent"
import { SelectedUtxosFeeResponse } from "packages/integration/src/lib/_ic_api/icrc1_oracle.d"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

import { Balance } from "@nfid/integration"

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
import { EMPTY, expand, firstValueFrom, from, last } from "rxjs"
import { KEY_BTC_ADDRESS } from "packages/integration/src/lib/authentication/storage"

export type BlockIndex = bigint

export type BitcointNetworkFeeAndUtxos = SelectedUtxosFeeResponse

export type BtcToCkBtcFee = {
  bitcointNetworkFee: BitcointNetworkFeeAndUtxos
  amountToReceive: bigint
  icpNetworkFee: bigint
}

export type CkBtcToBtcFee = {
  bitcointNetworkFee: BitcointNetworkFeeAndUtxos
  amountToReceive: bigint
  icpNetworkFee: bigint
  identityLabsFee: bigint
}

export class BitcoinService {
  public async getQuickAddress(): Promise<string> {
    const { cachedValue } = await this.getAddressFromCache()

    if (cachedValue == null) {
      let identity = await getWalletDelegation()
      return this.getAddress(identity)
    } else {
      return cachedValue as string
    }
  }

  public async getAddress(identity: SignIdentity): Promise<Address> {
    const { cachedValue, key } = this.getAddressFromCache()

    if (cachedValue != null) {
      return cachedValue as string
    }

    await patronService.askToPayFor(identity)
    const address: string = await chainFusionSignerService.getAddress(identity)
    localStorage.setItem(key, address)
    return address
  }

  public async getBalance(
    identity: SignIdentity,
    minConfirmations?: number,
  ): Promise<Balance> {
    await this.getAddress(identity)
    return chainFusionSignerService.getBalance(identity, minConfirmations)
  }

  public async getQuickBalance(): Promise<bigint> {
    const { cachedValue } = await this.getAddressFromCache()

    if (!cachedValue) {
      throw Error("No bitcoin address in a cache.")
    }

    return bitcoinCanisterService.getBalanceQuery(cachedValue as string)
  }

  public async getFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<BitcointNetworkFeeAndUtxos> {
    const confirmationResult = await this.ensureWalletConfirmations()
    if (!confirmationResult.ok) {
      throw new Error(confirmationResult.error)
    }
    const amountInSatoshis = satoshiService.getInSatoshis(amount)
    const balance = await this.getQuickBalance()

    return firstValueFrom(
      from(patronService.askToCalcUtxosAndFee(identity, amountInSatoshis)).pipe(
        expand((fee) => {
          const amountPlusFee = amountInSatoshis + fee.fee_satoshis
          const utxosAmount = fee.utxos.reduce((a, v) => a + v.value, BigInt(0))

          if (balance < amountPlusFee) {
            throw new Error(`Not enough funds.`)
          }

          if (amountPlusFee <= utxosAmount) {
            return EMPTY
          }

          return from(
            patronService.askToCalcUtxosAndFee(identity, amountPlusFee),
          )
        }),
        last(),
      ),
    )
  }

  public async getBtcToCkBtcFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<BtcToCkBtcFee> {
    const confirmationResult = await this.ensureWalletConfirmations()
    if (!confirmationResult.ok) {
      throw new Error(confirmationResult.error)
    }

    const checkerFee = satoshiService.getInSatoshis("0.000001")
    const icpNetworkFee = checkerFee
    const amountInSatoshis = satoshiService.getInSatoshis(amount)
    const bitcointNetworkFee: BitcointNetworkFeeAndUtxos =
      await patronService.askToCalcUtxosAndFee(identity, amountInSatoshis)

    return {
      bitcointNetworkFee,
      amountToReceive:
        amountInSatoshis - icpNetworkFee - bitcointNetworkFee.fee_satoshis,
      icpNetworkFee,
    }
  }

  public async getCkBtcToBtcFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<CkBtcToBtcFee> {
    return ckBtcService.getCkBtcToBtcFee(identity, amount)
  }

  private async transfer(
    identity: SignIdentity,
    destinationAddress: string,
    amount: bigint,
    fee: BitcointNetworkFeeAndUtxos,
  ): Promise<TransactionId> {
    const transactionId = await chainFusionSignerService.sendBtc(
      identity,
      destinationAddress,
      amount,
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

  public async send(
    identity: SignIdentity,
    destinationAddress: string,
    amount: string,
    fee: BitcointNetworkFeeAndUtxos,
  ): Promise<TransactionId> {
    const amountInSatoshis = satoshiService.getInSatoshis(amount)

    return this.transfer(identity, destinationAddress, amountInSatoshis, fee)
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

    const amountWithoutFees =
      satoshiService.getInSatoshis(amount) -
      fee.icpNetworkFee -
      fee.bitcointNetworkFee.fee_satoshis

    const txId: TransactionId = await this.transfer(
      identity,
      address,
      amountWithoutFees,
      fee.bitcointNetworkFee,
    )
    return txId
  }

  private getAddressFromCache() {
    const key = KEY_BTC_ADDRESS
    const cachedValue = localStorage.getItem(key)

    return {
      cachedValue,
      key,
    }
  }

  private async ensureWalletConfirmations(): Promise<{
    ok: boolean
    error?: string
  }> {
    const { cachedValue } = this.getAddressFromCache()
    if (!cachedValue) {
      return {
        ok: false,
        error: "No bitcoin address in cache for fee calculation.",
      }
    }
    try {
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
    } catch (e) {
      return {
        ok: false,
        error:
          "The Bitcoin service is currently unreachable. Please try again in a few minutes.",
      }
    }
  }
}

export const bitcoinService = new BitcoinService()
