import { Principal } from "@dfinity/principal"
import { useEffect, useState } from "react"

import { FT } from "frontend/integration/ft/ft"

import { getUserPrincipalId } from "../../tokens/utils"

export const useTokenInit = (token: FT | undefined) => {
  const [initedToken, setInitedToken] = useState<FT>()

  useEffect(() => {
    if (!token) return

    const initToken = async () => {
      if (token.isInited()) {
        setInitedToken(token)
        return
      }
      const { publicKey } = await getUserPrincipalId()
      const initializedToken = await token.init(Principal.fromText(publicKey))
      setInitedToken(initializedToken)
    }

    initToken()
  }, [token])

  return initedToken
}
