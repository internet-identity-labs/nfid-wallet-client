import { useActor } from "@xstate/react"
import { EarnDetails } from "packages/ui/src/organisms/earn/earn-details"
import { useContext, useMemo, memo } from "react"
import { useParams } from "react-router-dom"

import { ETH_NATIVE_ID, EVM_NATIVE } from "@nfid/integration/token/constants"
import { useSWRWithTimestamp } from "@nfid/swr"

import { ftService } from "frontend/integration/ft/ft-service"
import { ProfileContext } from "frontend/provider"

import { fetchTokens } from "../fungible-token/utils"
import { ModalType } from "../transfer-modal/types"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"
import { ChainId } from "@nfid/integration/token/icrc1/enum/enums"
import { WRAPPED_NATIVE_TOKEN } from "frontend/integration/aave"
import { useSupplyPositions } from "frontend/hooks"

const EarnDetailsPage = memo(() => {
  const { chainId, asset } = useParams()

  const {
    isViewOnlyMode,
    viewOnlyAddress,
    viewOnlyAddressType,
    transferService,
  } = useContext(ProfileContext)
  const [, send] = useActor(transferService)

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

  const { initedTokens, isLoading: isInitedLoading } = useTokensInit(tokens)

  const {
    isLoading: earnPositionsLoading,
    earnPositions,
    supportedTokens,
  } = useSupplyPositions(initedTokens, viewOnlyAddress)

  const token = useMemo(() => {
    if (!asset || !chainId || !supportedTokens) return
    const chain = Number(chainId)

    return supportedTokens.find((t) => {
      if (WRAPPED_NATIVE_TOKEN[chain].toLowerCase() === asset) {
        const nativeId =
          Number(chainId) === ChainId.ETH ? ETH_NATIVE_ID : EVM_NATIVE
        return t.getTokenAddress() === nativeId && t.getChainId() === chain
      } else {
        return (
          t.getTokenAddress().toLowerCase() === asset &&
          t.getChainId() === chain
        )
      }
    })
  }, [asset, chainId, supportedTokens])

  const onSupply = () => {
    if (!token) return
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.EARN })
    send({
      type: "ASSIGN_SELECTED_FT",
      data: {
        address: token.getTokenAddress(),
        chainId: token.getChainId(),
      },
    })
    send({ type: "ASSIGN_IS_EARN_UPDATE", data: true })
    send("SHOW")
  }

  const onWithdraw = () => {
    if (!token || !earnPosition) return
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.WITHDRAW })
    send({
      type: "ASSIGN_SELECTED_FT",
      data: {
        address: token.getTokenAddress(),
        chainId: token.getChainId(),
      },
    })
    send({ type: "ASSIGN_WITHDRAW_BALANCE", data: earnPosition.balance })
    send("SHOW")
  }

  const earnPosition = useMemo(() => {
    if (!chainId || !asset) return
    return earnPositions?.find(
      (p) => p.asset === asset && p.chainId === Number(chainId),
    )
  }, [earnPositions, chainId, asset])

  return (
    <EarnDetails
      earnPosition={earnPosition}
      isLoading={isInitedLoading || earnPositionsLoading}
      onSupply={onSupply}
      onWithdraw={onWithdraw}
      token={token}
    />
  )
})

export default EarnDetailsPage
