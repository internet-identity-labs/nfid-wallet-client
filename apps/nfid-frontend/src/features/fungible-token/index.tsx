import { ProfileAssets } from "packages/ui/src/organisms/tokens"
import {
  fetchAllTokens,
  fetchFilteredTokens,
} from "packages/ui/src/organisms/tokens/utils"
import { useEffect, useState } from "react"
import useSWR from "swr"

import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { ICRC1Error } from "@nfid/integration/token/icrc1/types"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { getLambdaCredentials } from "frontend/integration/lambda/util/util"

const ProfileAssetsPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRootPrincipalId, setUserRootPrincipalId] = useState("")

  const { data: activeTokens = [], isLoading: isActiveLoading } = useSWR(
    "activeTokens",
    fetchAllTokens,
  )

  const { data: filteredTokens = [] } = useSWR(
    ["filteredTokens", searchQuery],
    ([, query]) => fetchFilteredTokens(query),
  )

  const onSubmitIcrc1Pair = (ledgerID: string, indexID: string) => {
    let icrc1Pair = new Icrc1Pair(ledgerID, indexID)
    return icrc1Pair.storeSelf()
  }

  const onFetch = async (ledgerID: string, indexID: string) => {
    let icrc1Pair = new Icrc1Pair(ledgerID, indexID)
    console.log("userRootPrincipalId", userRootPrincipalId)
    return Promise.all([
      icrc1Pair.validateIfExists(userRootPrincipalId),
      icrc1Pair.validateStandard(),
      icrc1Pair.validateIndexCanister(),
    ])
      .then(() => icrc1Pair.getMetadata())
      .catch((e) => {
        throw new ICRC1Error(e)
      })
  }

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
      isActiveTokensLoading={isActiveLoading}
      onSubmitIcrc1Pair={onSubmitIcrc1Pair}
      onFetch={onFetch}
      profileConstants={ProfileConstants}
    />
  )
}

export default ProfileAssetsPage
