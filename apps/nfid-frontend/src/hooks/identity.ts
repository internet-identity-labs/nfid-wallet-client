import { SignIdentity } from "@dfinity/agent"
import { useEffect, useState } from "react"

import { getWalletDelegation } from "frontend/integration/facade/wallet"

export const useIdentity = (isViewOnlyMode?: boolean) => {
  const [isLoading, setIsLoading] = useState(false)
  const [identity, setIdentity] = useState<SignIdentity>()

  useEffect(() => {
    setIsLoading(true)
    getWalletDelegation()
      .then((delegation) => {
        setIdentity(delegation)
      })
      .catch((e) => {
        if (isViewOnlyMode) {
          console.debug("Identity error in View Only mode: ", e)
        } else {
          throw new Error("Identity error: ", e)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return { isLoading, identity }
}
