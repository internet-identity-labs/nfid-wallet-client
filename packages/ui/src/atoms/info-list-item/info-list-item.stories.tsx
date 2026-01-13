import { TooltipProvider } from "@radix-ui/react-tooltip"
import type { StoryFn, Meta } from "@storybook/react"

import { IconCmpCopy, IconCmpSettings } from "@nfid/ui"

import { InfoListItem } from "."

const Story: Meta<typeof InfoListItem> = {
  component: InfoListItem,
  title: "Atoms/InfoListItem",
}
export default Story

const Template: StoryFn<typeof InfoListItem> = (_args) => (
  <TooltipProvider>
    <div className="space-y-3">
      <InfoListItem
        title="From"
        children={
          <div className="flex items-center">
            0xC717...976F
            <IconCmpCopy className="ml-3 cursor-pointer" />
          </div>
        }
      />
      <InfoListItem
        title="Network fee"
        tooltip="tooltip"
        children={
          <div className="flex items-center">
            0 ETH
            <IconCmpSettings className="ml-2 cursor-pointer" />
          </div>
        }
      />
      <InfoListItem title="Total" isBold children={<p>0.65 ETH</p>} />
    </div>
  </TooltipProvider>
)

export const InfoList = {
  render: Template,
}
