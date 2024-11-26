import { Activity } from "packages/ui/src/organisms/activity"
import {
  fetchActiveTokens,
  fetchAllTokens,
} from "packages/ui/src/organisms/tokens/utils"
import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import useSWR from "swr"

import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { useActivityPagination } from "./hooks/pagination"

const ActivityPage = () => {
  const { state } = useLocation()
  const initialFilter = state && state.canisterId ? [state.canisterId] : []
  const data = useActivityPagination(initialFilter)
  const { data: allTokens = [], isLoading: isActiveLoading } = useSWR(
    "allTokens",
    fetchAllTokens,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  )

  const activeTokens = useMemo(() => {
    return allTokens.filter((token) => token.getTokenState() === State.Active)
  }, [allTokens])

  return (
    <Activity
      activityData={data}
      tokens={activeTokens}
      isTokensLoading={isActiveLoading}
    />
  )
}

export default ActivityPage
