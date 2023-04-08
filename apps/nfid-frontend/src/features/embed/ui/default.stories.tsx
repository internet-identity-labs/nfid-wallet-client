import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { DefaultComponent } from "./default"

export default {
  title: "DefaultComponent",
  component: DefaultComponent,
} as ComponentMeta<typeof DefaultComponent>

const Template: ComponentStory<typeof DefaultComponent> = (args) => (
  <TooltipProvider>
    <BrowserRouter>
      <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[574px] shadow-lg m-auto">
        <DefaultComponent {...args} />
      </ScreenResponsive>
    </BrowserRouter>
  </TooltipProvider>
)

export const Default = Template.bind({})

Default.args = {
  applicationMeta: {
    url: "rarible.com",
  },
  fromAddress: "0x51c20059d7084e3d381403939d5dc3158f891a8e",
  toAddress: "0x51c20059d7084e3d381403939d5dc3158f891a8e",
  network: "Ethereum",
  networkFee: "0",
  currency: "ETH",
  totalToken: "0.65",
  totalUSD: "853.12",
  warnings: [
    {
      title: "Transaction preview unavailable",
      subtitle:
        "Unable to estimate asset changes. Please make sure you trust this dapp.",
    },
  ],
}
