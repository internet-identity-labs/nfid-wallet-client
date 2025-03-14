import { StakingDetails } from "packages/ui/src/organisms/staking/staking-details"

export interface IStakingDetails {
  stakingBalance: string
  staked: string
  rewards: string
  symbol: string
  name: string
  logo: string
}

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

export enum StakingOptions {
  Available = "Available",
  Unlocking = "Unlocking",
  Locked = "Locked",
}

const StakingDetailsPage = () => {
  const stakingDetails = {
    stakingBalance: "14127.15",
    staked: "13279.521",
    rewards: "847.629",
    symbol: "ICP",
    name: "Internet Computer",
    logo: "#",
  }

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
  }

  return (
    <StakingDetails
      stakingDetails={stakingDetails}
      stakeOptions={stakeOptions}
    />
  )
}

export default StakingDetailsPage
