import { SignIdentity } from "@dfinity/agent"
import { CkBTCMinterCanister, RetrieveBtcOk } from "@dfinity/ckbtc"
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import { createAgent } from "@dfinity/utils"
import BigNumber from "bignumber.js"

import { BlockIndex, CkBtcToBtcFee } from "../bitcoin.service"
import { satoshiService } from "./satoshi.service"

const NANO_SECONDS_IN_MILLISECOND = BigInt(1_000_000)
const NANO_SECONDS_IN_SECOND = NANO_SECONDS_IN_MILLISECOND * BigInt(1_000)
const NANO_SECONDS_IN_MINUTE = NANO_SECONDS_IN_SECOND * BigInt(60)

class CkBtcService {
  public async convertCkBtcToBtc(
    identity: SignIdentity,
    address: string,
    amount: string,
    fee: CkBtcToBtcFee,
  ): Promise<BlockIndex> {
    const amountInSatoshis =
      satoshiService.getInSatoshis(amount) -
      fee.icpNetworkFee -
      fee.identityLabsFee

    await this.approve(identity, amountInSatoshis)
    const blockIndex = await this.retrieveBtc(
      identity,
      address,
      amountInSatoshis,
    )

    await this.approve(identity, fee.identityLabsFee)
    await ckBtcService.send(identity, FEE_ADDRESS, fee.identityLabsFee)

    return blockIndex
  }

  public async getCkBtcToBtcFee(
    identity: SignIdentity,
    amount: string,
  ): Promise<CkBtcToBtcFee> {
    const icpNetworkFee = satoshiService.getInSatoshis("0.0000001")
    const initialAmountInSatoshi = satoshiService.getInSatoshis(amount)
    const identityLabsFee: bigint = this.getIdentityLabsFee(
      initialAmountInSatoshi,
    )
    const amountInSatoshis: bigint =
      satoshiService.getInSatoshis(amount) - identityLabsFee - icpNetworkFee

    const minter = await this.getMinter(identity)
    const fee = await minter.estimateWithdrawalFee({ amount: amountInSatoshis })

    const btcNetworkFee = fee.bitcoin_fee + fee.minter_fee

    const amountToReceive =
      satoshiService.getInSatoshis(amount) -
      icpNetworkFee * BigInt(3) -
      identityLabsFee -
      btcNetworkFee

    return {
      bitcointNetworkFee: {
        fee_satoshis: btcNetworkFee,
        utxos: [],
      },
      identityLabsFee,
      amountToReceive,
      icpNetworkFee: icpNetworkFee * BigInt(3),
    }
  }

  public async send(
    identity: SignIdentity,
    address: string,
    amount: bigint,
  ): Promise<BlockIndex> {
    const ledger = await this.getLedger(identity)
    return ledger.transfer({
      to: { owner: Principal.fromText(address), subaccount: [] },
      amount,
    })
  }

  public async getBtcAddressToMintCkBtc(identity: SignIdentity) {
    const minter = await this.getMinter(identity)
    return minter.getBtcAddress({ owner: identity.getPrincipal() })
  }

  private async approve(identity: SignIdentity, amount: bigint): Promise<void> {
    const ledger = await this.getLedger(identity)

    await ledger.approve({
      spender: {
        owner: Principal.fromText(CK_BTC_MINTER_CANISTER_ID),
        subaccount: [],
      },
      amount,
      expires_at:
        this.nowInBigIntNanoSeconds() + BigInt(5) * NANO_SECONDS_IN_MINUTE,
      created_at_time: this.nowInBigIntNanoSeconds(),
    })
  }

  private getIdentityLabsFee(amountInSatoshis: bigint): bigint {
    const feePercentBigNumber = new BigNumber(FEE_PERCENT)
    const amountBigNumber = new BigNumber(amountInSatoshis.toString())
    const feeBigNmber = amountBigNumber.multipliedBy(feePercentBigNumber)
    return BigInt(feeBigNmber.toFixed(0))
  }

  private async retrieveBtc(
    identity: SignIdentity,
    address: string,
    amount: bigint,
  ): Promise<BlockIndex> {
    const minter = await this.getMinter(identity)

    const { block_index }: RetrieveBtcOk = await minter.retrieveBtcWithApproval(
      { address, amount },
    )

    return block_index
  }

  private nowInBigIntNanoSeconds(): bigint {
    return BigInt(Date.now()) * BigInt(1e6)
  }

  private async getLedger(identity: SignIdentity) {
    const agent = await createAgent({
      identity,
      host: IC_HOST,
    })
    const ledger = IcrcLedgerCanister.create({
      canisterId: Principal.fromText(CK_BTC_LEDGER_CANISTER_ID),
      agent,
    })

    return ledger
  }

  private async getMinter(identity: SignIdentity) {
    const agent = await createAgent({
      identity,
      host: IC_HOST,
    })
    const ledger = CkBTCMinterCanister.create({
      canisterId: Principal.fromText(CK_BTC_MINTER_CANISTER_ID),
      agent,
    })

    return ledger
  }
}

export const ckBtcService = new CkBtcService()
