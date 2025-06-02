import { useState } from "react"

import { getIdentity } from "frontend/features/transfer-modal/utils"
import { bitcoinService } from "frontend/integration/bitcoin/bitcoin.service"

export const useBtcAddress = () => {
  const [isBtcAddressLoading, setIsBtcAddressLoading] = useState(true)

  const setBtcAddress = async () => {
    try {
      const identity = await getIdentity([
        PATRON_CANISTER_ID,
        CHAIN_FUSION_SIGNER_CANISTER_ID,
      ])

      await bitcoinService.getAddress(identity)
    } catch (error) {
      console.error("Error in bitcoinService.getAddress: ", error)
    } finally {
      setIsBtcAddressLoading(false)
    }
  }

  return { setBtcAddress, isBtcAddressLoading }
}
