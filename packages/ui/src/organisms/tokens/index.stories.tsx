import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Meta, StoryFn } from "@storybook/react"
import { useState } from "react"
import { BrowserRouter as Router } from "react-router-dom"

import { State } from "@nfid/integration/token/icrc1/enum/enums"

import { FT } from "frontend/integration/ft/ft"

import { ProfileAssets, ProfileAssetsProps } from "."
import ProfileContainer from "../../atoms/profile-container/Container"

const createMockFT = (name: string, isHideable: boolean): FT => ({
  init: async () => createMockFT(name, isHideable),
  getTokenName: () => name,
  getTokenCategory: () => "Category",
  getTokenBalanceRaw: () => BigInt(1000000000000000000),
  getTokenBalanceFormatted: () => "1.0 MTK",
  getUSDBalanceFormatted: async () => "100 USD",
  getTokenAddress: () => "0xMockAddress",
  getTokenSymbol: () => "MTK",
  getTokenDecimals: () => 18,
  getTokenLogo: () => "https://via.placeholder.com/150",
  getTokenState: () => "Active" as State,
  getBlockExplorerLink: () => "https://etherscan.io/address/0xMockAddress",
  hideToken: async () => {},
  showToken: async () => {},
  getTokenFeeRaw: () => BigInt(1000),
  getTokenFeeFormatted: () => "0.001 MTK",
  getTokenFeeFormattedUsd: async () => "0.1 USD",
  getTokenRateFormatted: async () => "0.24 USD",
  getTokenRateRaw: async () => 0.24,
  isHideable: () => isHideable,
})

const mockActiveTokens: FT[] = [
  createMockFT("Token 1", true),
  createMockFT("Token 2", true),
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
