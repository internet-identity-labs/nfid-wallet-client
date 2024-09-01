import ProfileAssets from "packages/ui/src/organisms/tokens"
import {
  fetchAllTokens,
  fetchFilteredTokens,
} from "packages/ui/src/organisms/tokens/utils"
import { useEffect, useState } from "react"
import useSWR from "swr"

import { getLambdaCredentials } from "frontend/integration/lambda/util/util"

const ProfileAssetsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRootPrincipalId, setUserRootPrincipalId] = useState("")
  const { data: activeTokens = [], isLoading: isActiveLoading } = useSWR(
    "activeTokens",
    fetchAllTokens,
  )

  const { data: filteredTokens = [], isLoading: isFilterLoading } = useSWR(
    ["filteredTokens", searchQuery],
    ([, query]) => fetchFilteredTokens(query),
  )

  useEffect(() => {
    const setUserId = async () => {
      const { rootPrincipalId } = await getLambdaCredentials()
      if (!rootPrincipalId) return
      setUserRootPrincipalId(rootPrincipalId)
    }

    setUserId()
  }, [])

  return (
    <ProfileAssets
      activeTokens={activeTokens}
      filteredTokens={filteredTokens}
      setSearchQuery={(value) => setSearchQuery(value)}
      isFilterTokensLoading={isFilterLoading}
      isActiveTokensLoading={isActiveLoading}
      userRootPrincipalId={userRootPrincipalId}
    />
  )
}

export default ProfileAssetsPage
