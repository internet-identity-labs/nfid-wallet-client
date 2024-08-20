import { Meta, StoryFn } from "@storybook/react"

import { NFT } from "frontend/integration/nft/nft"

import { NFTDetails, NFTDetailsProps } from "./index"

const meta: Meta = {
  title: "Organisms/NFTs",
  component: NFTDetails,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

const mockNFT = {
  getCollectionId: () => "collection-id",
  getTokenId: () => "token-id",
  getAssetPreview: () => ({
    format: "img",
    url: "https://placehold.co/600x400",
  }),
  getTokenName: () => "First NFT",
  getCollectionName: () => "Collection",
  getTokenFloorPriceIcpFormatted: () => "0.5 ICP",
  getTokenFloorPriceUSDFormatted: () => "$10.00",
}

export const Default: StoryFn<NFTDetailsProps> = (args) => {
  return (
    <div className="p-[30px] overflow-hidden w-full">
      <NFTDetails {...args} />
    </div>
  )
}

Default.args = {
  nft: mockNFT as NFT,
}
