import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { AssetPreview } from "."

export default {
  title: "Embed/AssetPreview",
  component: AssetPreview,
} as ComponentMeta<typeof AssetPreview>

const Template: ComponentStory<typeof AssetPreview> = (args) => (
  <BrowserRouter>
    <ScreenResponsive className="relative overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100">
      <TooltipProvider>
        <AssetPreview {...args} />
      </TooltipProvider>
    </ScreenResponsive>
  </BrowserRouter>
)

export const Single = Template.bind({})
export const Batch = Template.bind({})

Single.args = {
  assets: [
    {
      title: "NFT title",
      subtitle: "Asset subtitle",
      icon: "https://cache.icpunks.com/icpunks//Token/6471",
    },
  ],
}

Batch.args = {
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
    {
      title: "NFT title",
      subtitle: "Asset subtitle",
      icon: "https://cache.icpunks.com/icpunks//Token/5662",
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
    {
      title: "NFT title",
      subtitle: "Asset subtitle",
      icon: "https://cache.icpunks.com/icpunks//Token/5662",
      innerTitle: "0.002 ETH",
      innerSubtitle: "$10.27",
    },
  ],
}
