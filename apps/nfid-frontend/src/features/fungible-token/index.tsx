import { DEFAULT_ERROR_TEXT } from "packages/constants"
import { resetIntegrationCache } from "packages/integration/src/cache"
import { Tokens } from "packages/ui/src/organisms/tokens"
import {
  fetchAllTokens,
  fetchFilteredTokens,
  getUserPrincipalId,
} from "packages/ui/src/organisms/tokens/utils"
import { useEffect, useState } from "react"
import useSWR from "swr"

import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { ICRC1Error } from "@nfid/integration/token/icrc1/types"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

const TokensPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRootPrincipalId, setUserRootPrincipalId] = useState("")

  const {
    data: activeTokens = [],
    isLoading: isActiveLoading,
    mutate: refetchActiveTokens,
  } = useSWR("activeTokens", fetchAllTokens)

  const { data: filteredTokens = [] } = useSWR(
    ["filteredTokens", searchQuery],
    ([, query]) => fetchFilteredTokens(query),
  )

  const onSubmitIcrc1Pair = (ledgerID: string, indexID: string) => {
    let icrc1Pair = new Icrc1Pair(
      ledgerID,
      indexID !== "" ? indexID : undefined,
    )
    return icrc1Pair.storeSelf().then(() => {
      resetIntegrationCache(["getICRC1Canisters"], () => {
        refetchActiveTokens()
      })
    })
  }

  const onFetch = async (ledgerID: string, indexID: string) => {
    let icrc1Pair = new Icrc1Pair(ledgerID, indexID)

    return await Promise.all([
      icrc1Pair.validateIfExists(userRootPrincipalId),
      icrc1Pair.validateStandard(),
      icrc1Pair.validateIndexCanister(),
    ])
      .then(() => icrc1Pair.getMetadata())
      .catch((e) => {
        if (e instanceof ICRC1Error) {
          throw new ICRC1Error(e.message)
        } else {
          throw new ICRC1Error(DEFAULT_ERROR_TEXT)
        }
      })
  }

  useEffect(() => {
    const setUserId = async () => {
      const { userPrincipal } = await getUserPrincipalId()
      if (!userPrincipal) return
      setUserRootPrincipalId(userPrincipal)
    }

    setUserId()
  }, [])

  return (
    <Tokens
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

export default TokensPage
