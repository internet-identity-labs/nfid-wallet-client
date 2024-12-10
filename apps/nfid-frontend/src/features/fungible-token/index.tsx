import { useActor } from "@xstate/react"
import { Tokens } from "packages/ui/src/organisms/tokens"
import { fetchTokens } from "packages/ui/src/organisms/tokens/utils"
import { useContext, useMemo, useState } from "react"
import useSWR from "swr"

import { storageWithTtl } from "@nfid/client-db"
import { authState } from "@nfid/integration"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { icrc1OracleCacheName } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"

const TokensPage = () => {
  const userRootPrincipalId = authState.getUserIdData().userId
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)
  const [, forceUpdate] = useState(0)

  const onSendClick = (selectedToken: string) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send("SHOW")
  }

  // TODO: use generateTokenKey instead of ForceUpdate
  const triggerForceUpdate = () => {
    forceUpdate((prev) => prev + 1)
  }

  const {
    data: tokens = [],
    mutate: refetchTokens,
    isLoading: isTokensLoading,
  } = useSWR("tokens", fetchTokens, {
    revalidateOnFocus: false,
  })

  const activeTokens = useMemo(() => {
    return tokens.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  const onSubmitIcrc1Pair = async (ledgerID: string, indexID: string) => {
    let icrc1Pair = new Icrc1Pair(
      ledgerID,
      indexID !== "" ? indexID : undefined,
    )
    await icrc1Pair.storeSelf()
    await storageWithTtl.remove(icrc1OracleCacheName)
    refetchTokens()
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

  return (
    <Tokens
      activeTokens={activeTokens}
      filteredTokens={tokens}
      isTokensLoading={isTokensLoading}
      onSubmitIcrc1Pair={onSubmitIcrc1Pair}
      onFetch={onFetch}
      profileConstants={ProfileConstants}
      onSendClick={onSendClick}
      onTokensUpdate={triggerForceUpdate}
    />
  )
}

export default TokensPage
