import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Meta, StoryFn } from "@storybook/react"

import { CopyAddress, CopyAddressProps } from "."

const meta: Meta = {
  title: "Molecules/Copy Address",
  component: CopyAddress,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<CopyAddressProps> = (args) => (
  <div className="p-[30px]">
    <TooltipProvider>
      <CopyAddress {...args} />
    </TooltipProvider>
  </div>
)

Default.args = {
  address: "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
  leadingChars: 6,
  trailingChars: 4,
}
