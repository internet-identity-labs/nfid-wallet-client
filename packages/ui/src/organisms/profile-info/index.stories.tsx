import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Meta, StoryFn } from "@storybook/react"

import { ProfileInfo, IProfileTemplate } from "."

const meta: Meta = {
  title: "Organisms/Profile Info",
  component: ProfileInfo,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<IProfileTemplate> = (args) => (
  <div className="p-[30px]">
    <TooltipProvider>
      <ProfileInfo {...args} />
    </TooltipProvider>
  </div>
)

Default.args = {
  value: 12345.67,
  address: "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
}
