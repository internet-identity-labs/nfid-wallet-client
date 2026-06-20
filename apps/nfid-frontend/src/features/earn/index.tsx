import { useActor } from "@xstate/react"
import { Earn } from "packages/ui/src/organisms/earn"
import { useContext, memo } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { ftService } from "frontend/integration/ft/ft-service"
import { ProfileContext } from "frontend/provider"

import { ModalType, SelectedToken } from "../transfer-modal/types"
import { fetchTokens } from "../fungible-token/utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"

import { useSupplyPositions } from "frontend/hooks"

const EarnPage = memo(() => {
  const navigate = useNavigate()
  const {
    isViewOnlyMode,
    viewOnlyAddress,
    viewOnlyAddressType,
    transferService,
  } = useContext(ProfileContext)
  const [, send] = useActor(transferService)
  const { search } = useLocation()

  const navigateWithSearch = (to: unknown) => {
    if (typeof to === "string") return navigate({ pathname: to, search })
    return navigate(to as never)
  }

  const onEarnClick = (selectedToken?: SelectedToken) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.EARN })
    if (selectedToken) {
      send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
      send({ type: "ASSIGN_IS_EARN_UPDATE", data: true })
    }
    send("SHOW")
  }

  const onWithdrawClick = (selectedToken: SelectedToken, balance: bigint) => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.WITHDRAW })
    send({ type: "ASSIGN_SELECTED_FT", data: selectedToken })
    send({ type: "ASSIGN_WITHDRAW_BALANCE", data: balance })
    send("SHOW")
  }

  const { data: tokens } = useSWRWithTimestamp(
    isViewOnlyMode ? ["tokens", viewOnlyAddress] : "tokens",
    () => {
      if (!isViewOnlyMode) return fetchTokens()
      if (viewOnlyAddressType === "icp")
        return ftService.getIcpViewOnlyTokens(viewOnlyAddress!)
      if (viewOnlyAddressType === "btc") return ftService.getBtcViewOnlyTokens()
      return ftService.getEvmViewOnlyTokens(viewOnlyAddress!)
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: isViewOnlyMode,
    },
  )

  const { initedTokens } = useTokensInit(tokens)

  const {
    isLoading: earnPositionsLoading,
    earnPositions,
    totalBalance,
    supportedTokens,
  } = useSupplyPositions(initedTokens, viewOnlyAddress)

  return (
    <Earn
      isLoading={earnPositionsLoading}
      earnPositions={earnPositions}
      links={ProfileConstants}
      navigate={navigateWithSearch}
      tokens={supportedTokens}
      totalBalance={totalBalance}
      onEarnClick={isViewOnlyMode ? undefined : onEarnClick}
      onWithdrawClick={isViewOnlyMode ? undefined : onWithdrawClick}
    />
  )
})

export default EarnPage
