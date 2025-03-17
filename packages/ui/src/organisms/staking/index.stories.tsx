import { Meta, StoryFn } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { Staking, StakingProps } from "."

export default {
  title: "Organisms/Staking",
  component: Staking,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} as Meta

const Template: StoryFn<StakingProps> = (args) => <Staking {...args} />

export const Default = Template.bind({})
Default.args = {
  stakes: [
    {
      symbol: "ICP",
      name: "Intenet Computer",
      logo: "data:image/png;base64,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",
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
  ] as any,
  isLoading: false,
  links: {
    base: "/staking",
    staking: "icp",
  },
  stakingInfo: {
    stakingBalance: "14127.15",
    staked: "13279.521",
    rewards: "847.629",
    symbol: "USD",
  },
}

export const Loading = Template.bind({})
Loading.args = {
  stakes: [
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
  ] as any,
  isLoading: true,
  links: {
    base: "/staking",
    staking: "icp",
  },
  stakingInfo: {
    stakingBalance: "14127.15",
    staked: "13279.521",
    rewards: "847.629",
    symbol: "USD",
  },
}

export const Empty = Template.bind({})
Empty.args = {
  stakes: [],
  isLoading: false,
  links: {
    base: "/staking",
    staking: "icp",
  },
  stakingInfo: {
    stakingBalance: "14127.15",
    staked: "13279.521",
    rewards: "847.629",
    symbol: "USD",
  },
}
