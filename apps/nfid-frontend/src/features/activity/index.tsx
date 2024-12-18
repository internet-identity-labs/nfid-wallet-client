import { Activity } from "packages/ui/src/organisms/activity"
import { fetchTokens } from "packages/ui/src/organisms/tokens/utils"
import { useMemo } from "react"
import { useLocation } from "react-router-dom"

import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { useSWR } from "@nfid/swr"

import { useActivityPagination } from "./hooks/pagination"

const ActivityPage = () => {
  const { state } = useLocation()
  const initialFilter = state && state.canisterId ? [state.canisterId] : []
  const data = useActivityPagination(initialFilter)
  const { data: tokens = [], isLoading: isActiveLoading } = useSWR(
    "tokens",
    fetchTokens,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  )

  const activeTokens = useMemo(() => {
    return tokens.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  return (
    <Activity
      activityData={data}
      tokens={activeTokens}
      isTokensLoading={isActiveLoading}
    />
  )
}

export default ActivityPage
