import { Principal } from "@icp-sdk/core/principal"
import { authState } from "packages/integration/src/lib/authentication/auth-state"
import { createContext, useCallback, useEffect, useState } from "react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { useBTCDepositsToMintCKBTCListener } from "frontend/hooks/btc-to-ckbtc"
import {
  fetchBtcAddress as fetchBtc,
  fetchAutoConversionBtc,
} from "frontend/util/fetch-btc-address"

type BtcAddressContextType = {
  btcAddress: string
  isBtcAddressLoading: boolean
  autoConversionBtcAddress: string
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
  const [autoConversionBtcAddress, setAutoConversionBtcAddress] = useState("")
  const [isAutoConversionLoading, setIsAutoConversionLoading] = useState(false)

  const fetchBtcAddress = useCallback(() => {
    if (!btcAddress && !isBtcAddressLoading) {
      setIsBtcAddressLoading(true)
      fetchBtc()
        .then((addr) => {
          setBtcAddress(addr)
        })
        .finally(() => setIsBtcAddressLoading(false))
    }
  }, [btcAddress, isBtcAddressLoading])

  const fetchAutoConversionAddress = useCallback(
    (principal: Principal) => {
      if (!autoConversionBtcAddress && !isAutoConversionLoading) {
        setIsAutoConversionLoading(true)
        fetchAutoConversionBtc(principal)
          .then((addr) => {
            setAutoConversionBtcAddress(addr)
          })
          .finally(() => setIsAutoConversionLoading(false))
      }
    },
    [autoConversionBtcAddress, isAutoConversionLoading],
  )

  const { isAuthenticated } = useAuthentication()

  useEffect(() => {
    if (isAuthenticated) {
      const principal = Principal.from(authState.getUserIdData().publicKey)
      fetchBtcAddress()
      fetchAutoConversionAddress(principal)
    }
  }, [isAuthenticated, fetchBtcAddress, fetchAutoConversionAddress])

  useBTCDepositsToMintCKBTCListener(
    isAuthenticated
      ? Principal.from(authState.getUserIdData().publicKey)
      : null,
  )

  return (
    <BtcAddressContext.Provider
      value={{
        btcAddress,
        isBtcAddressLoading,
        autoConversionBtcAddress,
        fetchBtcAddress,
      }}
    >
      {children}
    </BtcAddressContext.Provider>
  )
}
