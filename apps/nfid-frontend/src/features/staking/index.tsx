import { useActor } from "@xstate/react"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"

import { useSWRWithTimestamp } from "@nfid/swr"
import { useTokensInit } from "@nfid/ui/organisms/send-receive/hooks/token-init"
import { Staking } from "@nfid/ui/organisms/staking"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"

import { fetchTokens } from "../fungible-token/utils"
import { ModalType } from "../transfer-modal/types"

import { fetchStakedTokens } from "./utils"

const StakingPage = () => {
  const navigate = useNavigate()
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const onStakeClick = () => {
    send({ type: "ASSIGN_VAULTS", data: false })
    send({ type: "ASSIGN_SOURCE_WALLET", data: "" })
    send({ type: "CHANGE_DIRECTION", data: ModalType.STAKE })
    send("SHOW")
  }

  const { data: tokens } = useSWRWithTimestamp("tokens", fetchTokens, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  const { initedTokens } = useTokensInit(tokens)

  const { data: stakedTokens, isLoading } = useSWRWithTimestamp(
    initedTokens ? "stakedTokens" : null,
    () => fetchStakedTokens(initedTokens!, false),
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
      navigate={navigate}
      totalBalances={totalBalances}
      onStakeClick={onStakeClick}
    />
  )
}

export default StakingPage
