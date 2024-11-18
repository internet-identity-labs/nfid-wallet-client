import { Activity } from "packages/ui/src/organisms/activity"
import { fetchActiveTokens } from "packages/ui/src/organisms/tokens/utils"
import { useLocation } from "react-router-dom"
import useSWR from "swr"

import { useActivityPagination } from "./hooks/pagination"

interface ActivityPageProps {
  triedToComplete: (value: boolean) => void
}

const ActivityPage = ({ triedToComplete }: ActivityPageProps) => {
  const { state } = useLocation()
  const initialFilter = state && state.canisterId ? [state.canisterId] : []
  const data = useActivityPagination(initialFilter)
  const { data: activeTokens = [] } = useSWR("activeTokens", fetchActiveTokens)

  return (
    <Activity
      activityData={data}
      tokens={activeTokens}
      triedToComplete={triedToComplete}
    />
  )
}

export default ActivityPage
