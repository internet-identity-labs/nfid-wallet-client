import { useActor } from "@xstate/react"
import { Staking } from "packages/ui/src/organisms/staking"
import { useContext, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"

import { ModalType } from "../transfer-modal/types"
import { fetchStakedTokens } from "./utils"
import { fetchTokens } from "../fungible-token/utils"
import { State } from "@nfid/integration/token/icrc1/enum/enums"
import { useTokensInit } from "packages/ui/src/organisms/send-receive/hooks/token-init"

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

  const activeTokens = useMemo(() => {
    return tokens?.filter((token) => token.getTokenState() === State.Active)
  }, [tokens])

  const { initedTokens } = useTokensInit(activeTokens)

  const {
    data: stakedTokens,
    isLoading,
    isValidating,
  } = useSWRWithTimestamp(
    initedTokens ? "stakedTokens" : null,
    () => fetchStakedTokens(initedTokens!, false),
    {
      revalidateOnFocus: false,
    },
  )

  console.log("szzszs", stakedTokens, isLoading, isValidating)

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
