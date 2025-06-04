import { getIdentity } from "frontend/features/transfer-modal/utils"
import { bitcoinService } from "frontend/integration/bitcoin/bitcoin.service"

export const fetchBtcAddress = async () => {
  const identity = await getIdentity([
    PATRON_CANISTER_ID,
    CHAIN_FUSION_SIGNER_CANISTER_ID,
  ])

  const address = await bitcoinService.getAddress(identity)
  return address
}
