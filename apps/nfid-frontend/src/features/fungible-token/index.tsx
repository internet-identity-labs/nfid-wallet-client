import ProfileAssets from "packages/ui/src/organisms/tokens"
import {
  fetchAllTokens,
  fetchFilteredTokens,
} from "packages/ui/src/organisms/tokens/utils"
import { useState } from "react"
import useSWR from "swr"

import { Loader } from "@nfid-frontend/ui"

const ProfileAssetsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: activeTokens = [], isLoading } = useSWR(
    "activeTokens",
    fetchAllTokens,
  )

  const { data: filteredTokens = [], isLoading: isFilterLoading } = useSWR(
    ["filteredTokens", searchQuery],
    ([, query]) => fetchFilteredTokens(query),
  )

  if (!activeTokens.length || isLoading) return <Loader isLoading />

  return (
    <ProfileAssets
      activeTokens={activeTokens}
      filteredTokens={filteredTokens}
      setSearchQuery={(value) => setSearchQuery(value)}
    />
  )
}

export default ProfileAssetsPage
