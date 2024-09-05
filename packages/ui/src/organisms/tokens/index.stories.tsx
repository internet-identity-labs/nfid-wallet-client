import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Meta, StoryFn } from "@storybook/react"
import { useState } from "react"
import { BrowserRouter as Router } from "react-router-dom"

import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"

import { FT } from "frontend/integration/ft/ft"

import { Tokens, TokensProps } from "."
import ProfileContainer from "../../atoms/profile-container/Container"

const createMockFT = (name: string, isHideable: boolean): FT => ({
  init: async () => createMockFT(name, isHideable),
  getTokenName: () => name,
  getTokenCategory: () => "Category" as Category,
  getTokenCategoryFormatted: () => "Category",
  getTokenBalance: () => BigInt(1000000000000000000),
  getTokenBalanceFormatted: () => "1.0",
  getUSDBalanceFormatted: async () => "100 USD",
  getTokenAddress: () => "0xMockAddress",
  getTokenSymbol: () => "MTK",
  getTokenDecimals: () => 18,
  getTokenLogo: () => "https://via.placeholder.com/150",
  getTokenState: () => "Active" as State,
  getBlockExplorerLink: () => "https://etherscan.io/address/0xMockAddress",
  hideToken: async () => {},
  showToken: async () => {},
  getTokenFee: () => BigInt(1000),
  getTokenFeeFormatted: () => "0.001 MTK",
  getTokenFeeFormattedUsd: async () => "0.1 USD",
  getTokenRateFormatted: async () => "0.24 USD",
  getTokenRate: async () => 0.24,
  isHideable: () => isHideable,
})

const mockActiveTokens: FT[] = [
  createMockFT("Token 1", true),
  createMockFT("Token 2", true),
]

const meta: Meta = {
  title: "Organisms/Tokens",
  component: Tokens,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<TokensProps> = (args) => {
  const [filteredTokens, setFilteredTokens] = useState<FT[]>(mockActiveTokens)

  const handleSearchQuery = (query: string) => {
    const filtered = mockActiveTokens.filter((token) =>
      token.getTokenSymbol().toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredTokens(filtered)
  }
  return (
    <div className="p-[30px] min-h-[600px] overflow-hidden w-full">
      <ProfileContainer>
        <Router>
          <TooltipProvider>
            <Tokens
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
  activeTokens: mockActiveTokens,
  filteredTokens: mockActiveTokens,
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
