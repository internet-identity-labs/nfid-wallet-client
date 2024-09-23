import { Activity } from "packages/ui/src/organisms/activity"
import { fetchActiveTokens } from "packages/ui/src/organisms/tokens/utils"
import { useLocation } from "react-router-dom"
import useSWR from "swr"

import { useActivityPagination } from "./hooks"

const ActivityPage = () => {
  const { state } = useLocation()
  const initialFilter = state && state.canisterId ? [state.canisterId] : []
  const data = useActivityPagination(initialFilter)
  const { data: activeTokens = [], isLoading: isActiveLoading } = useSWR(
    "activeTokens",
    fetchActiveTokens,
  )

  return (
    <Activity
      activityData={data}
      tokens={activeTokens}
      isTokensLoading={isActiveLoading}
    />
  )
}

export default ActivityPage
