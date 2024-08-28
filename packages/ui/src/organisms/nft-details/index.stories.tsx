import { Meta, StoryFn } from "@storybook/react"

import {
  AssetPreview,
  NFTTransactions,
} from "frontend/integration/nft/impl/nft-types"
import { NFT } from "frontend/integration/nft/nft"

import { NFTDetails, NFTDetailsProps } from "./index"

const meta: Meta = {
  title: "Organisms/NFT",
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
    url: "https://placehold.co/450x450",
  }),
  getTokenName: () => "First NFT",
  getCollectionName: () => "Collection",
  getTokenFloorPriceIcpFormatted: () => "0.5 ICP",
  getTokenFloorPriceUSDFormatted: () => "$10.00",
}

const mockProperties = {
  mappedValues: [
    { category: "Color", option: "Red" },
    { category: "Size", option: "Medium" },
  ],
}

const mockTransactions = {
  activity: [
    {
      getTransactionView: () => ({
        getType: () => "Sale",
        getFormattedDate: () => "2024-08-20",
        getFrom: () => "user1",
        getTo: () => "user2",
      }),
    },
  ],
  isLastPage: true,
}

const mockAbout = "This is a description of the NFT."

const mockAssetPreview = {
  url: "https://placehold.co/450x450",
  format: "img",
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
  about: mockAbout,
  properties: mockProperties,
  transactions: mockTransactions as NFTTransactions,
  assetPreview: mockAssetPreview as AssetPreview,
  isAboutLoading: false,
  isPreviewLoading: false,
  isPropertiesLoading: false,
  isTransactionsLoading: false,
}
