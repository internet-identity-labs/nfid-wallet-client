import { bitcoinService } from "frontend/integration/bitcoin/bitcoin.service"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

export const fetchBtcAddress = async () => {
  const identity = await getWalletDelegation()
  const address = await bitcoinService.getAddress(identity)

  return address
}
