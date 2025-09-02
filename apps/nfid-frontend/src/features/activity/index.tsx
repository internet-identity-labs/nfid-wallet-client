import { Activity } from "packages/ui/src/organisms/activity"
import { useMemo } from "react"
import { useLocation } from "react-router-dom"

import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { useSWRWithTimestamp } from "@nfid/swr"

import { useIdentity } from "frontend/hooks/identity"

import { useActivityPagination } from "./hooks/pagination"

import { fetchTokens } from "../fungible-token/utils"

const ActivityPage = () => {
  const { state } = useLocation()
  const initialFilter = state && state.canisterId ? [state.canisterId] : []
  const data = useActivityPagination(initialFilter)
  const { data: tokens = [] } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  const activeTokens = useMemo(() => {
    return tokens.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  return <Activity activityData={data} tokens={activeTokens} />
}

export default ActivityPage
