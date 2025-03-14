import { Staking } from "packages/ui/src/organisms/staking"
import { useNavigate } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"

export interface IStakingInfo {
  stakingBalance: string
  staked: string
  rewards: string
  symbol: string
}

export interface IStake {
  symbol: string
  name: string
  logo: string
  staked: string
  stakedInUsd: string
  rewards: string
  rewardsInUsd: string
  isDiamond?: boolean
}

const StakingPage = () => {
  const navigate = useNavigate()
  const stakes = [
    {
      symbol: "ICP",
      name: "Intenet Computer",
      logo: "#",
      staked: "2,000.00 ICP",
      stakedInUsd: "14,207.03 USD",
      rewards: "40.08 ICP",
      rewardsInUsd: "284.71 USD",
      totalValue: "204.754 ICP",
      totalValueInUsd: "2514.47 USD",
      isDiamond: true,
    },
    {
      symbol: "ckETH",
      name: "ckETH",
      logo: "#",
      staked: "2,000.00 ckETH",
      stakedInUsd: "14,207.03 USD",
      rewards: "40.08 ckETH",
      rewardsInUsd: "284.71 USD",
      totalValue: "204.754 ckETH",
      totalValueInUsd: "2514.47 ckETH",
    },
  ]

  const stakingInfo: IStakingInfo = {
    stakingBalance: "14127.15",
    staked: "13279.521",
    rewards: "847.629",
    symbol: "USD",
  }

  return (
    <Staking
      isLoading={false}
      stakes={stakes}
      links={ProfileConstants}
      stakingInfo={stakingInfo}
      navigate={navigate}
    />
  )
}

export default StakingPage
