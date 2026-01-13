import { SignIdentity } from "@dfinity/agent"

import { useEffect, useState } from "react"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

export const useIdentity = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [identity, setIdentity] = useState<SignIdentity>()

  useEffect(() => {
    setIsLoading(true)
    getWalletDelegation().then((delegation) => {
      setIdentity(delegation)
      setIsLoading(false)
    })
  }, [])

  return { isLoading, identity }
}
