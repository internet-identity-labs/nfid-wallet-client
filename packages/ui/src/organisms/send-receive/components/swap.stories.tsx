import { Principal } from "@dfinity/principal"
import { Meta, StoryFn } from "@storybook/react"
import { FormProvider, useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { Quote } from "src/integration/swap/quote"

import {
  Category,
  ChainId,
  State,
} from "@nfid/integration/token/icrc1/enum/enums"

import { SwapFTUi, SwapFTUiProps } from "./swap"
import { TransferTemplate } from "./template"

const createMockToken = (symbol: string, name: string) => ({
  init: async (_: Principal) => SendFTProps.token,
  isInited: () => true,
  getTokenName: () => name,
  getTokenCategory: () => Category.Known,
  getTokenCategoryFormatted: () => "Unknown",
  getTokenBalance: () => BigInt(1000000000),
  getTokenBalanceFormatted: () => "10",
  getUSDBalanceFormatted: () => "$10",
  getUSDBalance: () => new BigNumber(10),
  getUSDBalanceDayChange: () => new BigNumber(0),
  getTokenRate: (_: string) => new BigNumber(1.0),
  getTokenRateDayChangePercent: () => ({ value: "0", positive: true }),
  getTokenRateFormatted: (_: string) => "$10",
  refreshBalance: async (_: Principal) => SendFTProps.token,
  getTokenAddress: () => "2ouva-viaaa-aaaaq-aaamq-cai",
  getTokenIndex: () => undefined,
  getTokenSymbol: () => symbol,
  getTokenDecimals: () => 8,
  getTokenLogo: () => "Some logo",
  getTokenState: () => State.Active,
  getBlockExplorerLink: () => "https://explorer.example.com",
  getIndexBlockExplorerLink: () => "https://explorer.example.com",
  getChainId: () => ChainId.ICP,
  hideToken: async () => {},
  showToken: async () => {},
  getTokenFee: async () => ({
    getFee: () => BigInt(10000),
  }),
  getTokenFeeFormatted: () => "0.0001",
  getTokenFeeFormattedUsd: () => "0.10 USD",
  isHideable: () => true,
  getRootSnsCanister: () => undefined,
  getIcrc2Allowances: async (_: Principal) => [],
  revokeAllowance: async (_: any, __: string) => {},
})

const mockTokens = [
  createMockToken("ICP", "Internet Computer"),
  createMockToken("CHAT", "Chat"),
]

const mockQuote = {
  getSourceAmountUSD: () => "1000 USD",
  getTargetAmountUSD: () => "1200 USD",
  getQuoteRate: () => "0.1",
  getTargetAmountPrettified: () => "0.12 BTC",
}

type FormFields = {
  amount: string
  to: string
}

const meta: Meta = {
  title: "Organisms/Send Receive Swap/Swap",
  component: SwapFTUi,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<SwapFTUiProps> = (args) => {
  const formMethods = useForm<FormFields>({
    defaultValues: {
      amount: "",
      to: "",
    },
  })

  return (
    <FormProvider {...formMethods}>
      <div className="w-[450px] h-[630px]">
        <TransferTemplate isOpen={true}>
          <div className="leading-10 text-[20px] font-bold first-letter:capitalize mb-[18px]">
            Swap
          </div>
          <SwapFTUi
            {...args}
            fromToken={mockTokens[0]}
            toToken={mockTokens[1]}
            setFromChosenToken={(value: string) => console.log(value)}
            setToChosenToken={(value: string) => console.log(value)}
          />
        </TransferTemplate>
      </div>
    </FormProvider>
  )
}

export const Default = Template.bind({
  tokens: mockTokens,
  allTokens: mockTokens,
  fromToken: mockTokens[0],
  toToken: mockTokens[1],
  submit: async (_: FormFields) => {
    console.log("Submit button clicked")
  },
  loadingMessage: "Loading tokens...",
  isTokenLoading: false,
  showServiceError: false,
  showLiquidityError: undefined,
  isQuoteLoading: false,
  quote: mockQuote as Quote,
  clearQuoteError: () => console.log("Clearing error"),
})

export const SendFTProps: any = {}

Default.args = SendFTProps
