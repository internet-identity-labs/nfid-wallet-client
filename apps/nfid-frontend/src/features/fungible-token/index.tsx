import ProfileAssets from "packages/ui/src/organisms/tokens"
import {
  fetchAllTokens,
  getActiveTokens,
  getFilteredTokens,
} from "packages/ui/src/organisms/tokens/utils"
import { useState } from "react"
import useSWR from "swr"

import { Loader } from "@nfid-frontend/ui"

const ProfileAssetsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: tokens = [], isLoading } = useSWR("tokens", fetchAllTokens)
  const { data: filteredTokens = [], isLoading: isFilterLoading } = useSWR(
    ["tokens", searchQuery],
    ([, query]) => getFilteredTokens(query),
  )
  // const { data: activeTokens = [], isLoading: isActiveLoading } = useSWR(
  //   "tokens",
  //   getActiveTokens,
  // )

  if (!tokens.length || isLoading) return <Loader isLoading />

  //console.log("1111", tokens[0].items[0].getTokenBalance(), isLoading)

  return (
    <ProfileAssets
      tokens={tokens}
      filteredTokens={filteredTokens}
      setSearchQuery={(value) => setSearchQuery(value)}
    />
  )
}

export default ProfileAssetsPage
