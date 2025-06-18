import { Meta, StoryFn } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { StakingDetails, StakingDetailsProps } from "./staking-details"

export default {
  title: "Organisms/StakingDetails",
  component: StakingDetails,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} as Meta

const Template: StoryFn<StakingDetailsProps> = (args) => (
  <StakingDetails {...args} />
)

export const Default = Template.bind({})
Default.args = {}

export const TokenNotFound = () => (
  <BrowserRouter>
    <StakingDetails />
  </BrowserRouter>
)
