import { useMemo } from "react"
import { useSWRWithTimestamp } from "@nfid/swr"
import { fetchTokens } from "./utils"
import { tokenManager } from "./token-manager"

interface UseCachedTokensOptions {
  revalidateOnFocus?: boolean
  revalidateOnMount?: boolean
  revalidateIfStale?: boolean
}

export const useCachedTokens = (options: UseCachedTokensOptions = {}) => {
  const {
    revalidateOnFocus = false,
    revalidateOnMount = false,
    revalidateIfStale = false,
  } = options

  const {
    data: rawTokens,
    isLoading,
    mutate,
  } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus,
    revalidateOnMount,
    revalidateIfStale,
  })

  const tokens = useMemo(() => {
    if (!rawTokens) return []
    return tokenManager.getCachedTokens(rawTokens)
  }, [rawTokens])

  return {
    tokens,
    isLoading,
    refetch: mutate,
    tokenManager,
  }
}
