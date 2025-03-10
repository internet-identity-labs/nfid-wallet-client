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
      token: "ICP",
      staked: "2,000.00 ICP",
      rewards: "40.08 ICP",
      usdValue: "14,207.03 USD",
      rewardsUsdValue: "284.71 USD",
    },
    {
      token: "ckETH",
      staked: "2,000.00 ckETH",
      rewards: "40.08 ckETH",
      usdValue: "14,207.03 USD",
      rewardsUsdValue: "284.71 USD",
    },
  ],
  isLoading: false,
  links: {
    base: "/staking",
    staking: "icp",
  },
}

export const Loading = Template.bind({})
Loading.args = {
  stakes: [
    {
      token: "ICP",
      staked: "2,000.00 ICP",
      rewards: "40.08 ICP",
      usdValue: "14,207.03 USD",
      rewardsUsdValue: "284.71 USD",
    },
    {
      token: "ckETH",
      staked: "2,000.00 ckETH",
      rewards: "40.08 ckETH",
      usdValue: "14,207.03 USD",
      rewardsUsdValue: "284.71 USD",
    },
  ],
  isLoading: true,
  links: {
    base: "/staking",
    staking: "icp",
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
}
