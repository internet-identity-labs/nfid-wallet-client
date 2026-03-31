import { Activity } from "packages/ui/src/organisms/activity"
import { useContext, useMemo, useState, memo } from "react"
import { useLocation } from "react-router-dom"

import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { useSWRWithTimestamp } from "@nfid/swr"

import { useActivityFilter } from "./hooks/filter"

import { ProfileContext } from "frontend/provider"
import { fetchTokens } from "../fungible-token/utils"
import {
  addressBookFacade,
  SearchRequest,
} from "frontend/integration/address-book"
import { ftService } from "frontend/integration/ft/ft-service"

const ActivityPage = memo(() => {
  const { state } = useLocation()
  const initialFilter = state?.canisterId ? [state.canisterId] : []
  const [tokenFilter, setTokenFilter] = useState<string[]>(initialFilter)
  const [chainFilter, setChainFilter] = useState<string[]>([])
  const [txFilter, setTxFilter] = useState<string[]>([])

  const { isViewOnlyMode, viewOnlyAddress, viewOnlyAddressType } =
    useContext(ProfileContext)

  const { data: tokens = [] } = useSWRWithTimestamp(
    isViewOnlyMode ? ["tokens", viewOnlyAddress] : "tokens",
    () => {
      if (!isViewOnlyMode) return fetchTokens()

      if (viewOnlyAddressType === "icp")
        return ftService.getIcpViewOnlyTokens(viewOnlyAddress!)
      if (viewOnlyAddressType === "btc") return ftService.getBtcViewOnlyTokens()
      return ftService.getEvmViewOnlyTokens(viewOnlyAddress!)
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  )

  const activeTokens = useMemo(() => {
    return tokens.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  const data = useActivityFilter({
    activeTokens,
    tokenFilter,
    chainFilter,
    txFilter,
    viewOnlyAddress: isViewOnlyMode
      ? (viewOnlyAddress ?? undefined)
      : undefined,
    viewOnlyAddressType: isViewOnlyMode ? viewOnlyAddressType : null,
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
})

export default ActivityPage
