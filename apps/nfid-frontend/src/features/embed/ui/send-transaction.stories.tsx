import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { SendTransaction } from "./send-transaction"

export default {
  title: "Embed/SendTransaction",
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
    <ScreenResponsive className="relative overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100">
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
export const BatchBuy = Template.bind({})

Default.args = {
  assets: [
    {
      title: "Solo Sensei #2969",
      subtitle: "Degenerate Ape Academy",
      icon: "%PUBLIC_URL%/static/media/nfid_icon_3.ff2998627f895912249f25edd7a79eed.svg",
    },
  ],
}

Mint.args = {
  title: "Mint collectible",
}

Sell.args = {
  title: "Sell collectible",

  fromAddress: undefined,
  toAddress: undefined,

  totalUSD: "notFound",
  totalToken: "notFound",

  assets: [
    {
      title: "Solo Sensei #2969",
      subtitle: "Degenerate Ape Academy",
      icon: "%PUBLIC_URL%/static/media/nfid_icon_3.ff2998627f895912249f25edd7a79eed.svg",
    },
  ],
}

Buy.args = {
  title: "Buy collectible",

  assets: [
    {
      title: "Solo Sensei #2969",
      subtitle: "Degenerate Ape Academy",
      icon: "%PUBLIC_URL%/static/media/nfid_icon_3.ff2998627f895912249f25edd7a79eed.svg",
    },
  ],
  price: "0.01",
}

BatchBuy.args = {
  title: "Buy multiple collectibles",

  assets: [
    {
      title: "NFT title",
      subtitle: "Asset subtitle",
      icon: "https://cache.icpunks.com/icpunks//Token/6471",
      innerTitle: "0.002 ETH",
      innerSubtitle: "$10.27",
    },
    {
      title: "NFT title",
      subtitle: "Asset subtitle",
      icon: "https://cache.icpunks.com/icpunks//Token/1528",
      innerTitle: "0.002 ETH",
      innerSubtitle: "$10.27",
    },
    {
      title: "NFT title",
      subtitle: "Asset subtitle",
      icon: "https://cache.icpunks.com/icpunks//Token/6662",
      innerTitle: "0.002 ETH",
      innerSubtitle: "$10.27",
    },
    {
      title: "NFT title",
      subtitle: "Asset subtitle",
      icon: "https://cache.icpunks.com/icpunks//Token/6602",
      innerTitle: "0.002 ETH",
      innerSubtitle: "$10.27",
    },
    {
      title: "NFT title",
      subtitle: "Asset subtitle",
      icon: "https://cache.icpunks.com/icpunks//Token/5662",
      innerTitle: "0.002 ETH",
      innerSubtitle: "$10.27",
    },
  ],

  price: "0.29",
}

DeployCollection.args = {
  title: "Deploy collection",
}
