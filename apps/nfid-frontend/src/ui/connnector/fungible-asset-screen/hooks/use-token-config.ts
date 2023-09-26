import { useState } from "react"
import { fungibleAssetFactory } from "src/ui/connnector/fungible-asset-screen/fungible-asset-factory"
import useSWR from "swr"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"

import { TokenConfig } from "../../types"
import { mergeSingleTokenConfig } from "../util/util"

type UseTokenConfig = {
  tokens: string[]
}

export const useTokenConfig = ({ tokens }: UseTokenConfig) => {
  const [configs, setConfigs] = useState<TokenConfig[]>([])
  const { isAuthenticated } = useAuthentication()
  const { data, ...rest } = useSWR(
    isAuthenticated ? ["useTokenConfig", tokens] : null,
    ([key, tokens]) =>
      Promise.all(
        tokens.map(async (token) => {
          try {
            const res = await fungibleAssetFactory.getTokenConfigs(token)

            if (res && res.length) {
              res.map((r) =>
                setConfigs((prevConfigs) =>
                  mergeSingleTokenConfig(prevConfigs, r),
                ),
              )
            }

            return res
          } catch (e) {
            // FIXME: handle case when request fails
            console.error("useTokenConfig", e)
            return []
          }
        }),
      ),
  )

  return { configs, ...rest }
}
