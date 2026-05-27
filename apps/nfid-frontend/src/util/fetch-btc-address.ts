import { Principal } from "@icp-sdk/core/principal"
import { btcDepositService } from "@nfid/integration/token/btc/service"
import { bitcoinService } from "frontend/integration/bitcoin/bitcoin.service"

export const fetchBtcAddress = async () => {
  return await bitcoinService.getQuickAddress()
}

export const fetchAutoConversionBtc = async (principal: Principal) => {
  return await btcDepositService.generateAddress(principal)
}
