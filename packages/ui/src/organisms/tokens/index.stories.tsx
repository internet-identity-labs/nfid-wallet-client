import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Meta, StoryFn } from "@storybook/react"
import { useState } from "react"
import { BrowserRouter as Router } from "react-router-dom"

import { FT } from "frontend/integration/ft/ft"

import { ProfileAssets, ProfileAssetsProps } from "."
import ProfileContainer from "../../atoms/profile-container/Container"

const mockActiveTokens = [
  {
    getTokenName: () => "Mock Token 1",
    getTokenCategory: () => "Category 1",
    getTokenBalance: () => ({ formatted: "1.0 MTK1" }),
    getUSDBalanceFormatted: async () => "100 USD",
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
    getTokenBalance: () => ({ formatted: "5.0 MTK2" }),
    getUSDBalanceFormatted: async () => "500 USD",
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
  const [filteredTokens, setFilteredTokens] = useState<FT[]>(
    mockActiveTokens as FT[],
  )

  const handleSearchQuery = (query: string) => {
    const filtered = mockActiveTokens.filter((token) =>
      token.getTokenSymbol().toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredTokens(filtered as FT[])
  }
  return (
    <div className="p-[30px] min-h-[600px] overflow-hidden w-full">
      <ProfileContainer>
        <Router>
          <TooltipProvider>
            <ProfileAssets
              {...args}
              filteredTokens={filteredTokens}
              setSearchQuery={handleSearchQuery}
            />
          </TooltipProvider>
        </Router>
      </ProfileContainer>
    </div>
  )
}

Default.args = {
  activeTokens: mockActiveTokens as FT[],
  filteredTokens: mockActiveTokens as FT[],
  isActiveTokensLoading: false,
  setSearchQuery: (v: string) => console.log("Search query:", v),
  profileConstants: {
    base: "/wallet",
    activity: "activity",
  },
  onSubmit: async () => console.log("onSubmit called"),
  onFetch: async () => ({
    name: "Mock Token",
    symbol: "MTK",
    logo: "https://via.placeholder.com/150",
    decimals: 18,
    fee: BigInt(1000),
  }),
}
