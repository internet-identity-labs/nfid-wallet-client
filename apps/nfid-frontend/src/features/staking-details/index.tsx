import { SignIdentity } from "@dfinity/agent"
import { useActor } from "@xstate/react"
import { StakingDetails } from "packages/ui/src/organisms/staking/staking-details"
import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { useSWR } from "@nfid/swr"

<<<<<<< HEAD
import { stakingService } from "frontend/integration/staking/service/staking-service-impl"
import { ProfileContext } from "frontend/provider"
=======
export interface IStakingOption {
  id: string
  initial: string
  initialInUsd: string
  rewards: string
  rewardsInUsd: string
  total: string
  totalInUsd: string
  lockTime: string
  unlockIn?: string
  isDiamond?: boolean
  createdAt: number
  unlockAt?: number
  type: StakingOptions
}
>>>>>>> 782a690988 (Create storybook components for the staking [sc-17573] (#2691))

import { fetchStakedToken } from "../staking/utils"
import { ModalType } from "../transfer-modal/types"
import { getIdentity } from "../transfer-modal/utils"

const StakingDetailsPage = () => {
  const { tokenSymbol } = useParams()
  const [identity, setIdentity] = useState<SignIdentity>()

<<<<<<< HEAD
  const globalServices = useContext(ProfileContext)
  const [, send] = useActor(globalServices.transferService)

  const {
    data: stakedToken,
    isLoading,
    isValidating,
  } = useSWR(
    tokenSymbol ? ["stakedToken", tokenSymbol] : null,
    () => fetchStakedToken(tokenSymbol!, identity!),
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    const getSignIdentity = async () => {
      if (!stakedToken) return
      const token = stakedToken.getToken()
      const rootCanisterId = token.getRootSnsCanister()
      if (!rootCanisterId) return
      const canister_ids = await stakingService.getTargets(rootCanisterId)
      if (!canister_ids) return

      const identity = await getIdentity([
        canister_ids,
        token.getTokenAddress(),
      ])
      setIdentity(identity)
    }

    getSignIdentity()
  }, [stakedToken])

  const onRedeemOpen = () => {
    send({ type: "CHANGE_DIRECTION", data: ModalType.REDEEM })
    send("SHOW")
=======
  const stakeOptions = {
    Available: [
      {
        id: "5695121862339497860",
        initial: "2,000.00 ICP",
        initialInUsd: "14,207.03 USD",
        rewards: "40.08 ICP",
        rewardsInUsd: "284.71 USD",
        total: "204.754 ICP",
        totalInUsd: "2514.47 USD",
        lockTime: "2 years",
        createdAt: 1656295343000,
        isDiamond: true,
        type: StakingOptions.Available,
      },
    ],
    Unlocking: [
      {
        id: "5695121862339497861",
        initial: "2,000.00 ICP",
        initialInUsd: "14,207.03 USD",
        rewards: "40.08 ICP",
        rewardsInUsd: "284.71 USD",
        total: "204.754 ICP",
        totalInUsd: "2514.47 USD",
        lockTime: "2 years",
        unlockIn: "4 months, 124 days",
        createdAt: 1656295343000,
        unlockAt: 1656295343000,
        type: StakingOptions.Unlocking,
      },
    ],
    Locked: [
      {
        id: "5695121862339497862",
        initial: "2,000.00 ICP",
        initialInUsd: "14,207.03 USD",
        rewards: "40.08 ICP",
        rewardsInUsd: "284.71 USD",
        total: "204.754 ICP",
        totalInUsd: "2514.47 USD",
        lockTime: "2 years",
        createdAt: 1656295343000,
        type: StakingOptions.Locked,
      },
      {
        id: "5695121862339497863",
        initial: "2,000.00 ICP",
        initialInUsd: "14,207.03 USD",
        rewards: "40.08 ICP",
        rewardsInUsd: "284.71 USD",
        total: "204.754 ICP",
        totalInUsd: "2514.47 USD",
        lockTime: "2 years",
        createdAt: 1656295343000,
        type: StakingOptions.Locked,
      },
    ],
>>>>>>> 782a690988 (Create storybook components for the staking [sc-17573] (#2691))
  }

  return (
    <StakingDetails
      onRedeemOpen={onRedeemOpen}
      stakedToken={stakedToken}
      isLoading={isLoading || isValidating}
      identity={identity}
    />
  )
}

export default StakingDetailsPage
