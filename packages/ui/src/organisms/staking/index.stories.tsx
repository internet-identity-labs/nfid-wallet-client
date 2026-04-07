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
  stakedTokens: [],
  isLoading: false,
  links: { base: "/staking", staking: "icp" },
  navigate: (() => {}) as unknown as StakingProps["navigate"],
  totalBalances: undefined,
  onStakeClick: undefined,
} satisfies StakingProps

export const Loading = Template.bind({})
Loading.args = {
  stakedTokens: undefined,
  isLoading: true,
  links: { base: "/staking", staking: "icp" },
  navigate: (() => {}) as unknown as StakingProps["navigate"],
  totalBalances: undefined,
  onStakeClick: undefined,
} satisfies StakingProps

export const Empty = Template.bind({})
Empty.args = {
  stakedTokens: [],
  isLoading: false,
  links: {
    base: "/staking",
    staking: "icp",
  },
  navigate: (() => {}) as unknown as StakingProps["navigate"],
  totalBalances: undefined,
  onStakeClick: undefined,
} satisfies StakingProps
