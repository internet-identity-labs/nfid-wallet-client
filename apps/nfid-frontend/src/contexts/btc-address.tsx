import { Principal } from "@dfinity/principal"

import { createContext, useCallback, useEffect, useState } from "react"

import { authState } from "@nfid/integration"
import { btcDepositService } from "@nfid/integration/token/btc/service"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useBTCDepositsToMintCKBTCListener } from "frontend/hooks/btc-to-ckbtc"
import { fetchBtcAddress as fetch } from "frontend/util/fetch-btc-address"

type BtcAddressContextType = {
  btcAddress: string
  isBtcAddressLoading: boolean
  fetchBtcAddress: () => void
}

export const BtcAddressContext = createContext<
  BtcAddressContextType | undefined
>(undefined)

export const BtcAddressProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [btcAddress, setBtcAddress] = useState("")
  const [isBtcAddressLoading, setIsBtcAddressLoading] = useState(false)

  const fetchBtcAddress = useCallback(() => {
    if (!btcAddress && !isBtcAddressLoading) {
      setIsBtcAddressLoading(true)
      fetch()
        .then((addr) => {
          setBtcAddress(addr)
        })
        .finally(() => setIsBtcAddressLoading(false))
    }
  }, [btcAddress, isBtcAddressLoading])

  const { isAuthenticated } = useAuthentication()

  useEffect(() => {
    if (isAuthenticated) {
      const principal = Principal.from(authState.getUserIdData().publicKey)
      btcDepositService.generateAddress(principal)
      fetchBtcAddress()
    }
  }, [isAuthenticated, fetchBtcAddress])

  useBTCDepositsToMintCKBTCListener(
    isAuthenticated
      ? Principal.from(authState.getUserIdData().publicKey)
      : null,
  )

  return (
    <BtcAddressContext.Provider
      value={{ btcAddress, isBtcAddressLoading, fetchBtcAddress }}
    >
      {children}
    </BtcAddressContext.Provider>
  )
}
