import { Principal } from "@dfinity/principal"
import { useActor } from "@xstate/react"
import { useTokenInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { Tokens } from "packages/ui/src/organisms/tokens"
import { fetchTokens } from "packages/ui/src/organisms/tokens/utils"
import { useContext, useEffect, useMemo, useState } from "react"
import { userPrefService } from "src/integration/user-preferences/user-pref-service"

import { storageWithTtl } from "@nfid/client-db"
import { authState } from "@nfid/integration"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { icrc1OracleCacheName } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { FT } from "frontend/integration/ft/ft"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"

const TokensPage = () => {
  const [hideZeroBalance, setHideZeroBalance] = useState(false)
  const [initedTokens, setInitedTokens] = useState<FT[]>([])
  const [isInitLoading, setIsInitLoading] = useState(false)
  const userRootPrincipalId = authState.getUserIdData().userId
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const onSendClick = (selectedToken: string) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send("SHOW")
  }

  const {
    data: tokens = [],
    mutate: refetchTokens,
    isLoading: isTokensLoading,
    isValidating: isTokenFetching,
  } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
  })

  const activeTokens = useMemo(() => {
    return tokens.filter((token) => token.getTokenState() === State.Active)
  }, [tokens, hideZeroBalance])

  useEffect(() => {
    const initTokens = async () => {
      setIsInitLoading(true)
      const { publicKey } = authState.getUserIdData()
      const inited = await Promise.all(
        activeTokens.map(async (token) => {
          await token.init(Principal.fromText(publicKey))
          return token
        }),
      )
      setInitedTokens(inited)
      setIsInitLoading(false)
    }

    initTokens()
  }, [tokens])

  const filteredTokens = useMemo(() => {
    if (!hideZeroBalance)
      return initedTokens.filter((token): token is FT => !!token)
    return initedTokens.filter(
      (token): token is FT =>
        token !== undefined && Number(token.getTokenBalance()) > 0,
    )
  }, [initedTokens, hideZeroBalance])

  useEffect(() => {
    userPrefService.getUserPreferences().then((userPref) => {
      setHideZeroBalance(userPref.isHideZeroBalance())
    })
  }, [])

  const onZeroBalanceToggle = () => {
    userPrefService.getUserPreferences().then((userPref) => {
      userPref.setHideZeroBalance(!hideZeroBalance)
      setHideZeroBalance(!hideZeroBalance)
    })
  }

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
      activeTokens={filteredTokens}
      allTokens={tokens}
      isTokensLoading={isTokensLoading || isTokenFetching || isInitLoading}
      onSubmitIcrc1Pair={onSubmitIcrc1Pair}
      onFetch={onFetch}
      profileConstants={ProfileConstants}
      onSendClick={onSendClick}
      hideZeroBalance={hideZeroBalance}
      onZeroBalanceToggle={onZeroBalanceToggle}
    />
  )
}

export default TokensPage
