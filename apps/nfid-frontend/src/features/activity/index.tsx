import { Activity } from "packages/ui/src/organisms/activity"
import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { useSWRWithTimestamp } from "@nfid/swr"

import { useActivityFilter } from "./hooks/filter"

import { fetchTokens } from "../fungible-token/utils"
import {
  addressBookFacade,
  SearchRequest,
} from "frontend/integration/address-book"

const ActivityPage = () => {
  const { state } = useLocation()
  const initialFilter = state && state.canisterId ? [state.canisterId] : []
  const [tokenFilter, setTokenFilter] = useState<string[]>(initialFilter)
  const [chainFilter, setChainFilter] = useState<string[]>([])
  const [txFilter, setTxFilter] = useState<string[]>([])

  const { data: tokens = [] } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  const activeTokens = useMemo(() => {
    return tokens.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  const data = useActivityFilter({
    activeTokens,
    tokenFilter,
    chainFilter,
    txFilter,
  })

  const searchAddress = async (req: SearchRequest) => {
    return addressBookFacade.search(req)
  }

  return (
    <Activity
      tokens={activeTokens}
      activityData={{
        ...data,
        activities: data.activities ?? [],
      }}
      tokenFilter={tokenFilter}
      setTokenFilter={setTokenFilter}
      chainFilter={chainFilter}
      setChainFilter={setChainFilter}
      txFilter={txFilter}
      setTxFilter={setTxFilter}
      searchAddress={searchAddress}
    />
  )
}

export default ActivityPage
