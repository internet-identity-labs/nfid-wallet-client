import { createContext, useContext, useCallback, useEffect, useState } from "react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { etheriumService } from "frontend/integration/etherium/etherium.service"
import { getWalletDelegation } from "frontend/integration/facade/wallet"

type EthAddressContextType = {
  ethAddress: string
  isEthAddressLoading: boolean
  fetchEthAddress: () => void
}

export const EthAddressContext = createContext<EthAddressContextType | null>(null)

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
        let identity = await getWalletDelegation()
        const address = await etheriumService.getAddress(identity)
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

export const useEthAddress = () => {
  const ctx = useContext(EthAddressContext)
  if (!ctx) {
    throw new Error("useEthAddress must be used within <EthAddressProvider>")
  }
  return ctx
}
