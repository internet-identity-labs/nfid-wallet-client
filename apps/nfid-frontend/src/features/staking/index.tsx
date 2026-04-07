import { useSelector } from "@xstate/react"
import { Staking } from "packages/ui/src/organisms/staking"
import { useContext, memo } from "react"
import { useNavigate, useLocation } from "react-router-dom"

import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { ftService } from "frontend/integration/ft/ft-service"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"
import { fetchTokens } from "../fungible-token/utils"
import { fetchStakedTokens, fetchViewOnlyStakedTokens } from "./utils"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"

const StakingPage = memo(() => {
  const navigate = useNavigate()
  const {
    isViewOnlyMode,
    viewOnlyAddress,
    viewOnlyAddressType,
    transferService,
  } = useContext(ProfileContext)
  const _snapshot = useSelector(transferService, (s) => s)
  const send = (event: any) => transferService.send(event)
  const { search } = useLocation()

  const navigateWithSearch = (to: unknown) => {
    if (typeof to === "string") return navigate({ pathname: to, search })
    return navigate(to as never)
  }

  const onStakeClick = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.STAKE })
    send({ type: "SHOW" })
  }

  const { data: tokens } = useSWRWithTimestamp(
    isViewOnlyMode ? ["tokens", viewOnlyAddress] : "tokens",
    () => {
      if (!isViewOnlyMode) return fetchTokens()
      if (viewOnlyAddressType === "icp")
        return ftService.getIcpViewOnlyTokens(viewOnlyAddress!)
      return Promise.resolve([])
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: isViewOnlyMode,
    },
  )

  const { initedTokens } = useTokensInit(tokens)

  const isNonIcpViewOnly = isViewOnlyMode && viewOnlyAddressType !== "icp"

  const { data: stakedTokens, isLoading } = useSWRWithTimestamp(
    isNonIcpViewOnly
      ? ["stakedTokens", viewOnlyAddress]
      : initedTokens
        ? isViewOnlyMode
          ? ["stakedTokens", viewOnlyAddress]
          : "stakedTokens"
        : null,
    () =>
      isNonIcpViewOnly
        ? Promise.resolve([])
        : isViewOnlyMode
          ? fetchViewOnlyStakedTokens(viewOnlyAddress!, initedTokens!)
          : fetchStakedTokens(initedTokens!, false),
    {
      revalidateOnFocus: false,
    },
  )

  const totalBalances = stakingService.getTotalBalances(stakedTokens)

  return (
    <Staking
      isLoading={isLoading}
      stakedTokens={stakedTokens}
      links={ProfileConstants}
      navigate={navigateWithSearch}
      totalBalances={totalBalances}
      onStakeClick={isViewOnlyMode ? undefined : onStakeClick}
    />
  )
})

export default StakingPage
