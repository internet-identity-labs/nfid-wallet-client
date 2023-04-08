import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { Mint } from "./mint"

export default {
  title: "Mint",
  component: Mint,
} as ComponentMeta<typeof Mint>

const Template: ComponentStory<typeof Mint> = (args) => (
  <BrowserRouter>
    <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100">
      <TooltipProvider>
        <Mint {...args} />
      </TooltipProvider>
    </ScreenResponsive>
  </BrowserRouter>
)

export const MintComponent = Template.bind({})

MintComponent.args = {
  applicationMeta: {
    name: "Review",
    url: "rarible.com",
  },
  fromAddress: "0x51c20059d7084e3d381403939d5dc3158f891a8e",
  toAddress: "0x51c20059d7084e3d381403939d5dc3158f891a8e",
  network: "Ethereum",
  networkFee: "0.0091–0.0118",
  currency: "ETH",
  totalToken: "0.0091–0.0118",
  totalUSD: "16.35",
  warnings: [
    {
      title: "Network is busy",
      subtitle: (
        <div className="">
          <span>Gas prices are high and estimates are less accurate.</span>
          <span className="text-blue-600">Adjust the network fee.</span>
        </div>
      ),
    },
  ],

  assetTitle: "Solo Sensei #2969",
  assetColectionName: "Degenerate Ape Academy",
}
