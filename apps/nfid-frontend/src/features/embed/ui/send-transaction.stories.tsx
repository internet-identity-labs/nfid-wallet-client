import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { SendTransaction } from "./send-transaction"

export default {
  title: "SendTransaction",
  component: SendTransaction,
  args: {
    applicationMeta: {
      name: "Review",
      url: "rarible.com",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Rarible_Logo.png/480px-Rarible_Logo.png",
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
          <>
            Gas prices are high and estimates are less accurate.
            <span className="text-blue-600"> Adjust the network fee.</span>
          </>
        ),
      },
    ],
  },
} as ComponentMeta<typeof SendTransaction>

const Template: ComponentStory<typeof SendTransaction> = (args) => (
  <BrowserRouter>
    <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100">
      <TooltipProvider>
        <SendTransaction {...args} />
      </TooltipProvider>
    </ScreenResponsive>
  </BrowserRouter>
)

export const Default = Template.bind({})
export const Mint = Template.bind({})
export const DeployCollection = Template.bind({})
export const Sell = Template.bind({})
export const Buy = Template.bind({})

Default.args = {
  assetTitle: "Solo Sensei #2969",
  assetCollectionName: "Degenerate Ape Academy",
  assetUrl:
    "https://nfid.imgix.net//static/media/nfid_icon_3.ff2998627f895912249f25edd7a79eed.svg?auto=format",
}

Mint.args = {
  title: "Mint collectible",

  assetTitle: "Solo Sensei #2969",
  assetCollectionName: "Degenerate Ape Academy",
  assetUrl:
    "https://nfid.imgix.net//static/media/nfid_icon_3.ff2998627f895912249f25edd7a79eed.svg?auto=format",
}

Sell.args = {
  title: "Pre-authorize withdrawal",

  assetTitle: "BitCoin Elep #40",
  assetCollectionName: "BitCoin Elep",
  assetUrl:
    "https://nfid.imgix.net//static/media/nfid_icon_3.ff2998627f895912249f25edd7a79eed.svg?auto=format",
}

Buy.args = {
  title: "Buy collectible",

  assetTitle: "Solo Sensei #2969",
  assetCollectionName: "Degenerate Ape Academy",
  assetUrl:
    "https://nfid.imgix.net//static/media/nfid_icon_3.ff2998627f895912249f25edd7a79eed.svg?auto=format",
}
