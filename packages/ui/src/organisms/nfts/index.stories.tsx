import { Meta, StoryFn } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { NFT } from "frontend/integration/nft/nft"

import { NFTs, INFTs } from "./index"

const meta: Meta = {
  title: "Organisms/NFTs",
  component: NFTs,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

const mockNFTs = [
  {
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
  },
  {
    getCollectionId: () => "collection-id",
    getTokenId: () => "token-id",
    getAssetPreview: () => ({
      format: "img",
      url: "https://placehold.co/600x400",
    }),
    getTokenName: () => "Second NFT",
    getCollectionName: () => "Collection",
    getTokenFloorPriceIcpFormatted: () => undefined,
    getTokenFloorPriceUSDFormatted: () => undefined,
  },
  {
    getCollectionId: () => "collection-id",
    getTokenId: () => "token-id",
    getAssetPreview: () => ({
      format: "img",
      url: "https://placehold.co/600x400",
    }),
    getTokenName: () => "Third NFT",
    getCollectionName: () => "Collection",
    getTokenFloorPriceIcpFormatted: () => "0.5 ICP",
    getTokenFloorPriceUSDFormatted: () => undefined,
  },
]

export const Default: StoryFn<INFTs> = (args) => {
  return (
    <div className="p-[30px] overflow-hidden w-full">
      <Router>
        <NFTs {...args} />
      </Router>
    </div>
  )
}

Default.args = {
  nfts: mockNFTs as NFT[],
  links: ProfileConstants,
  searchTokens: (tokens: NFT[], search: string) => {
    return tokens.filter(
      (nft) =>
        nft.getTokenName().toLowerCase().includes(search.toLowerCase()) ||
        nft.getCollectionName().toLowerCase().includes(search.toLowerCase()),
    )
  },
  isLoading: false,
}
