import { Staking } from "packages/ui/src/organisms/staking"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useSWRWithTimestamp } from "@nfid/swr"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

import { fetchStakedTokens } from "./utils"

export interface IStakingInfo {
  stakingBalance: string
  staked: string
  rewards: string
  symbol: string
}

const StakingPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const getParams = async () => {
      //const params = await stakingService.getStakeCalculator(token, identity)
    }

    getParams()
  }, [])

  const { data: stakedTokens = [], isLoading } = useSWRWithTimestamp(
    "stakedTokens",
    fetchStakedTokens,
    { revalidateOnFocus: false },
  )

  const stakingInfo: IStakingInfo = {
    stakingBalance: "14127.15",
    staked: "13279.521",
    rewards: "847.629",
    symbol: "USD",
  }

  return (
    <Staking
      isLoading={isLoading}
      stakedTokens={stakedTokens}
      links={ProfileConstants}
      stakingInfo={stakingInfo}
      navigate={navigate}
    />
  )
}

export default StakingPage
