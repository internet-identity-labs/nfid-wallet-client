import { SignIdentity } from "@dfinity/agent"
import { CkBTCMinterCanister, RetrieveBtcOk } from "@dfinity/ckbtc"
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc"
import { Principal } from "@dfinity/principal"
import { createAgent } from "@dfinity/utils"
import BigNumber from "bignumber.js"

import { BlockIndex } from "../bitcoin.service"
import { satoshiService } from "./satoshi.service"

const NANO_SECONDS_IN_MILLISECOND = BigInt(1_000_000)
const NANO_SECONDS_IN_SECOND = NANO_SECONDS_IN_MILLISECOND * BigInt(1_000)
const NANO_SECONDS_IN_MINUTE = NANO_SECONDS_IN_SECOND * BigInt(60)

class CkBtcService {
  public async convertCkBtcToBtc(
    identity: SignIdentity,
    address: string,
    amount: string,
  ): Promise<BlockIndex> {
    const amountInSatoshis = satoshiService.getInSatoshis(amount)
    await this.approve(identity, amountInSatoshis)
    const blockIndex = await this.retrieveBtc(identity, address, amountInSatoshis)

    const fee = this.getFee(amountInSatoshis)
    await this.approve(identity, fee)
    await ckBtcService.send(identity, FEE_ADDRESS, fee)

    return blockIndex
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

  private async retrieveBtc(
    identity: SignIdentity,
    address: string,
    amount: bigint,
  ): Promise<BlockIndex> {
    const agent = await createAgent({
      identity,
      host: IC_HOST,
    })

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

  private getFee(amountInSatoshis: bigint): bigint {
    const feePercentBigNumber = new BigNumber(FEE_PERCENT)
    const amountBigNumber = new BigNumber(amountInSatoshis.toString())
    const feeBigNmber = amountBigNumber.multipliedBy(feePercentBigNumber)
    return BigInt(feeBigNmber.toFixed(0))
  }
}

export const ckBtcService = new CkBtcService()
