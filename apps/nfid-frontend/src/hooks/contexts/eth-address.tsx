import { useContext } from "react"

import { EthAddressContext } from "frontend/contexts/eth-address"

export const useEthAddress = () => {
  const ctx = useContext(EthAddressContext)
  if (!ctx) {
    throw new Error("useEthAddress must be used within <EthAddressProvider>")
  }
  return ctx
}
