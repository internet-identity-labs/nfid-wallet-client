import { useActor } from "@xstate/react"
import {
  resetLocalStorageTTLCache,
} from "packages/integration/src/cache"
import { Tokens } from "packages/ui/src/organisms/tokens"
import {
  fetchActiveTokens,
  fetchAllTokens,
  getUserPrincipalId,
} from "packages/ui/src/organisms/tokens/utils"
import { useContext, useEffect, useState } from "react"
import useSWR from "swr"

import { sendReceiveTracking } from "@nfid/integration"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { icrc1OracleCacheName } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"

const TokensPage = () => {
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)
  const [searchQuery, setSearchQuery] = useState("")
  const [userRootPrincipalId, setUserRootPrincipalId] = useState("")

  const onSendClick = (selectedToken: string) => {
    sendReceiveTracking.openModal()
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send("SHOW")
  }

  const {
    data: activeTokens = [],
    isLoading: isActiveLoading,
    mutate: refetchActiveTokens,
  } = useSWR("activeTokens", fetchActiveTokens)

  const { data: allTokens = [] } = useSWR(
    ["allTokens", searchQuery],
    ([, query]) => fetchAllTokens(query),
  )

  const onSubmitIcrc1Pair = (ledgerID: string, indexID: string) => {
    let icrc1Pair = new Icrc1Pair(
      ledgerID,
      indexID !== "" ? indexID : undefined,
    )
    return icrc1Pair.storeSelf().then(() => {
      resetLocalStorageTTLCache([icrc1OracleCacheName], () => {
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
        throw e
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
      filteredTokens={allTokens}
      setSearchQuery={(value) => setSearchQuery(value)}
      isActiveTokensLoading={isActiveLoading}
      onSubmitIcrc1Pair={onSubmitIcrc1Pair}
      onFetch={onFetch}
      profileConstants={ProfileConstants}
      onSendClick={onSendClick}
    />
  )
}

export default TokensPage
