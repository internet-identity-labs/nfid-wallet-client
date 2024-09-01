import { Meta, StoryFn } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { FT } from "frontend/integration/ft/ft"

import { ProfileAssets, ProfileAssetsProps } from "."

const mockActiveTokens = [
  {
    getTokenName: () => "Mock Token 1",
    getTokenCategory: () => "Category 1",
    getTokenBalance: () => ({ formatted: "1.0" }),
    getUSDBalanceFormatted: async () => "$100",
    getTokenAddress: () => "0xMockAddress1",
    getTokenSymbol: () => "MTK1",
    getTokenDecimals: () => 18,
    getTokenFee: async () => ({
      formatted: "0.001",
      formattedUsd: "0.1 USD",
    }),
    getTokenLogo: () => "https://via.placeholder.com/150",
    getTokenState: () => "Active",
    getBlockExplorerLink: () => "https://etherscan.io/address/0xMockAddress1",
    hideToken: async () => {},
    showToken: async () => {},
    isHideable: () => true,
  },
  {
    getTokenName: () => "Mock Token 2",
    getTokenCategory: () => "Category 2",
    getTokenBalance: () => ({ formatted: "5.0" }),
    getUSDBalanceFormatted: async () => "$500",
    getTokenAddress: () => "0xMockAddress2",
    getTokenSymbol: () => "MTK2",
    getTokenDecimals: () => 18,
    getTokenFee: async () => ({
      formatted: "0.005",
      formattedUsd: "0.5 USD",
    }),
    getTokenLogo: () => "https://via.placeholder.com/150",
    getTokenState: () => "Active",
    getBlockExplorerLink: () => "https://etherscan.io/address/0xMockAddress2",
    hideToken: async () => {},
    showToken: async () => {},
    isHideable: () => true,
  },
]

const meta: Meta = {
  title: "Organisms/Tokens",
  component: ProfileAssets,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<ProfileAssetsProps> = (args) => {
  return (
    <div className="p-[30px] overflow-hidden w-full">
      <Router>
        <ProfileAssets {...args} />
      </Router>
    </div>
  )
}

Default.args = {
  activeTokens: mockActiveTokens as FT[],
  filteredTokens: mockActiveTokens as FT[],
  isActiveTokensLoading: false,
  isFilterTokensLoading: false,
  setSearchQuery: (v: string) => console.log("Search query:", v),
  userRootPrincipalId: "mockPrincipalId",
  profileConstants: {
    base: "/wallet",
    activity: "activity",
  },
}
