import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Meta, StoryFn } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { StakingOptions } from "frontend/features/staking-details"

import { StakingSidePanel, StakingSidePanelProps } from "./staking-side-panel"

export default {
  title: "Organisms/StakingSidePanel",
  component: StakingSidePanel,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} as Meta

const Template: StoryFn<StakingSidePanelProps> = (args) => (
  <div className="h-[600px]">
    <TooltipProvider>
      <StakingSidePanel {...args} />
    </TooltipProvider>
  </div>
)

export const Default = Template.bind({})
Default.args = {
  isOpen: true,
  onClose: () => console.log("Side Panel closed"),
  sidePanelOption: {
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
}
