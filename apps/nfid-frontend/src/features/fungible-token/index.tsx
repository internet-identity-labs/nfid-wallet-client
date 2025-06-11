import { useActor } from "@xstate/react"
import { Tokens } from "packages/ui/src/organisms/tokens"
import { fetchTokens, initTokens } from "packages/ui/src/organisms/tokens/utils"
import { useContext, useEffect, useMemo, useState } from "react"
import { userPrefService } from "src/integration/user-preferences/user-pref-service"

import { storageWithTtl } from "@nfid/client-db"
import { authState } from "@nfid/integration"
import { CKBTC_CANISTER_ID } from "@nfid/integration/token/constants"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { Icrc1Pair } from "@nfid/integration/token/icrc1/icrc1-pair/impl/Icrc1-pair"
import { icrc1OracleCacheName } from "@nfid/integration/token/icrc1/service/icrc1-oracle-service"
import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { useBtcAddress } from "frontend/hooks/btc-address"
import { FT } from "frontend/integration/ft/ft"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"

const TokensPage = () => {
  const [hideZeroBalance, setHideZeroBalance] = useState(false)
  const userRootPrincipalId = authState.getUserIdData().userId
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)
  const [initedTokens, setInitedTokens] = useState<Array<FT> | undefined>()
  const { isBtcAddressLoading } = useBtcAddress()

  const onSendClick = (selectedToken: string) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SEND })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send("SHOW")
  }

  const onSwapClick = (selectedToken: string) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.SWAP })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send({ type: "ASSIGN_SELECTED_TARGET_FT", data: "" })
    send("SHOW")
  }

  const onConvertToCkBtc = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.CONVERT })
    send("SHOW")
  }

  const onConvertToBtc = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.CONVERT })
    send({ type: "ASSIGN_SELECTED_FT", data: CKBTC_CANISTER_ID })
    send("SHOW")
  }

  const { data: tokens = undefined, mutate: refetchTokens } =
    useSWRWithTimestamp("tokens", fetchTokens, {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    })

  const activeTokens = useMemo(() => {
    return tokens?.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  useEffect(() => {
    if (activeTokens) {
      initTokens(activeTokens, isBtcAddressLoading).then(setInitedTokens)
    }
  }, [activeTokens, isBtcAddressLoading])

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
      tokensIniting={!initedTokens}
      activeTokens={activeTokens || []}
      allTokens={tokens || []}
      isTokensLoading={!activeTokens}
      onSubmitIcrc1Pair={onSubmitIcrc1Pair}
      onFetch={onFetch}
      profileConstants={ProfileConstants}
      onSendClick={onSendClick}
      onSwapClick={onSwapClick}
      onConvertToBtc={onConvertToBtc}
      onConvertToCkBtc={onConvertToCkBtc}
      hideZeroBalance={hideZeroBalance}
      onZeroBalanceToggle={onZeroBalanceToggle}
      isBtcAddressLoading={isBtcAddressLoading}
    />
  )
}

export default TokensPage
