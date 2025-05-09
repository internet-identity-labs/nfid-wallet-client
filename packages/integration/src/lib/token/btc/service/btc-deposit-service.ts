import { actor } from "../../../actors"
import {
  BTC_DEPOSIT_CHECK_INTERVAL,
  BTC_DEPOSIT_CONFIRMATIONS,
  CKBTC_MINTER_CANISTER_ID,
} from "../constants"
import { idlFactory as ckbtcMinterIDL } from "../idl/ckbtc_minter"
import { _SERVICE as CkbtcMinter, Status } from "../idl/ckbtc_minter.d"
import { BTCAddress, BTCDeposit } from "../types"

export class BTCDepositService {
  private minter: CkbtcMinter

  constructor() {
    this.minter = actor<CkbtcMinter>(CKBTC_MINTER_CANISTER_ID, ckbtcMinterIDL)
  }

  async generateAddress(): Promise<BTCAddress> {
    const result = await this.minter.get_btc_address()
    return {
      address: result.address,
      derivationPath: result.derivation_path,
      createdAt: new Date(),
    }
  }

  async getDepositStatus(txId: string): Promise<BTCDeposit> {
    const status = await this.minter.get_deposit_status(txId)
    return {
      address: status.address,
      amount: status.amount,
      status: status.status,
      txId: status.tx_id,
      createdAt: new Date(Number(status.created_at)),
      confirmedAt: status.confirmed_at
        ? new Date(Number(status.confirmed_at))
        : undefined,
      confirmations:
        status.status === Status.confirmed ? BTC_DEPOSIT_CONFIRMATIONS : 0,
    }
  }

  async monitorDeposit(txId: string): Promise<void> {
    const checkStatus = async () => {
      const status = await this.getDepositStatus(txId)

      if (status.status === Status.confirmed) {
        return
      }

      setTimeout(checkStatus, BTC_DEPOSIT_CHECK_INTERVAL)
    }

    await checkStatus()
  }
}

export const btcDepositService = new BTCDepositService()
