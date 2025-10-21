import { bitcoinService } from "frontend/integration/bitcoin/bitcoin.service"

export const fetchBtcAddress = async () => {
  return await bitcoinService.getQuickAddress()
}
