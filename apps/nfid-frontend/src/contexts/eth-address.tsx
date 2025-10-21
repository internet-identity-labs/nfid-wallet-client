import { createContext, useCallback, useEffect, useState } from "react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { fetchEthAddress as fetch } from "frontend/util/fetch-eth-address"

type EthAddressContextType = {
  ethAddress: string
  isEthAddressLoading: boolean
  fetchEthAddress: () => void
}

export const EthAddressContext = createContext<EthAddressContextType | null>(
  null,
)

export const EthAddressProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [ethAddress, setEthAddress] = useState("")
  const [isEthAddressLoading, setIsEthAddressLoading] = useState(false)

  const fetchEthAddress = useCallback(async () => {
    if (!ethAddress && !isEthAddressLoading) {
      setIsEthAddressLoading(true)
      try {
        const address = await fetch()
        setEthAddress(address)
      } catch (error) {
        console.error("Error fetching ETH address:", error)
      } finally {
        setIsEthAddressLoading(false)
      }
    }
  }, [ethAddress, isEthAddressLoading])

  const { isAuthenticated } = useAuthentication()

  useEffect(() => {
    if (isAuthenticated) {
      fetchEthAddress()
    }
  }, [isAuthenticated, fetchEthAddress])

  return (
    <EthAddressContext.Provider
      value={{ ethAddress, isEthAddressLoading, fetchEthAddress }}
    >
      {children}
    </EthAddressContext.Provider>
  )
}
