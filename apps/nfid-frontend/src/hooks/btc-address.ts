import { useCallback, useState } from "react"

import { fetchBtcAddress } from "frontend/util/fetch-btc-address"

export const useBtcAddress = () => {
  const [btcAddress, setBtcAddress] = useState("")
  const [isBtcAddressLoading, setIsBtcAddressLoading] = useState(false)

  const refetchBtcAddress = useCallback(() => {
    if (!btcAddress && !isBtcAddressLoading) {
      setIsBtcAddressLoading(true)
      fetchBtcAddress()
        .then(setBtcAddress)
        .finally(() => {
          setIsBtcAddressLoading(false)
        })
    }
  }, [btcAddress, isBtcAddressLoading])

  return {
    btcAddress,
    isBtcAddressLoading,
    fetchBtcAddress: refetchBtcAddress,
  }
}
