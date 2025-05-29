import { CkBTCMinterCanister } from "@dfinity/ckbtc"
import { Principal } from "@dfinity/principal"

import { agent } from "../../../agent"

const CKBTC_MINTER_CANISTER_ID = "mqygn-kiaaa-aaaar-qaadq-cai"
const BTC_DEPOSIT_CHECK_INTERVAL = 7 * 60 * 1000 // 7 minues in millis

export class BtсDepositService {
  private minter: CkBTCMinterCanister

  constructor() {
    this.minter = CkBTCMinterCanister.create({
      agent,
      canisterId: Principal.fromText(CKBTC_MINTER_CANISTER_ID),
    })
  }

  async generateAddress(principal: Principal): Promise<string> {
    try {
      const btcAddress = await this.minter.getBtcAddress({
        owner: principal,
      })
      console.log(
        `[BtсDepositService] Retrieved BTC address for principal: ${principal}`,
      )
      return btcAddress
    } catch (error) {
      console.log(
        `[BtсDepositService] Error generating BTC address for principal: ${principal}`,
        error,
      )
      throw error
    }
  }

  async monitorDeposit(principal: Principal) {
    let isUpdating = false

    const func = async () => {
      if (isUpdating) return

      isUpdating = true
      try {
        await this.updateBalance(principal)
      } catch (error) {
        console.error(
          "[BtсDepositService] updateBalance failed:",
          JSON.stringify(error, null, 2),
        )
      } finally {
        isUpdating = false
      }
    }

    const interval = setInterval(func, BTC_DEPOSIT_CHECK_INTERVAL)

    func()

    return {
      clearInterval: () => clearInterval(interval),
    }
  }

  async updateBalance(principal: Principal) {
    console.log(
      `[BtсDepositService] Checking for BTC deposit: ${principal.toText()}`,
    )
    return this.minter.updateBalance({ owner: principal })
  }
}

export const btcDepositService = new BtсDepositService()
