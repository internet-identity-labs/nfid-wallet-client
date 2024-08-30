import ProfileAssets from "packages/ui/src/organisms/tokens"
import {
  fetchAllTokens,
  fetchFilteredTokens,
} from "packages/ui/src/organisms/tokens/utils"
import { useState } from "react"
import useSWR from "swr"

const ProfileAssetsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: activeTokens = [], isLoading: isActiveLoading } = useSWR(
    "activeTokens",
    fetchAllTokens,
  )

  const { data: filteredTokens = [], isLoading: isFilterLoading } = useSWR(
    ["filteredTokens", searchQuery],
    ([, query]) => fetchFilteredTokens(query),
  )

  return (
    <ProfileAssets
      activeTokens={activeTokens}
      filteredTokens={filteredTokens}
      setSearchQuery={(value) => setSearchQuery(value)}
      isFilterTokensLoading={isFilterLoading}
      isActiveTokensLoading={isActiveLoading}
    />
  )
}

export default ProfileAssetsPage
