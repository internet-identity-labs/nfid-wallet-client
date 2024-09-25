import { Principal } from "@dfinity/principal"
import { Meta, StoryFn } from "@storybook/react"
import { FormProvider, useForm } from "react-hook-form"

import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"

import { FT } from "frontend/integration/ft/ft"
import { Quote } from "frontend/integration/icpswap/quote"

import { SwapFTUi, SwapFTUiProps } from "./swap"
import { TransferTemplate } from "./template"

const mockTokens = [
  {
    init: async (_: Principal) => SendFTProps.token,
    getTokenName: () => "Internet Computer",
    getTokenCategory: () => Category.Known,
    getTokenCategoryFormatted: () => "Unknown",
    getTokenBalance: () => BigInt(1000000000),
    getTokenBalanceFormatted: () => "10",
    getUSDBalanceFormatted: async () => "$10",
    getTokenRate: async (_: string) => 1.0,
    getTokenRateFormatted: async (_: string) => "$10",
    getTokenAddress: () => "2ouva-viaaa-aaaaq-aaamq-cai",
    getTokenSymbol: () => "ICP",
    getTokenDecimals: () => 8,
    getTokenLogo: () => "Some logo",
    getTokenState: () => State.Active,
    getBlockExplorerLink: () => "https://explorer.example.com",
    hideToken: async () => {},
    showToken: async () => {},
    getTokenFee: () => BigInt(10000),
    getTokenFeeFormatted: () => "0.0001 CHAT",
    getTokenFeeFormattedUsd: async () => "0.10 USD",
    isHideable: () => true,
  },
  {
    init: async (_: Principal) => SendFTProps.token,
    getTokenName: () => "Chat",
    getTokenCategory: () => Category.Known,
    getTokenCategoryFormatted: () => "Unknown",
    getTokenBalance: () => BigInt(1000000000),
    getTokenBalanceFormatted: () => "10",
    getUSDBalanceFormatted: async () => "$10",
    getTokenRate: async (_: string) => 1.0,
    getTokenRateFormatted: async (_: string) => "$10",
    getTokenAddress: () => "2ouva-viaaa-aaaaq-aaamq-cai",
    getTokenSymbol: () => "CHAT",
    getTokenDecimals: () => 8,
    getTokenLogo: () => "Some logo",
    getTokenState: () => State.Active,
    getBlockExplorerLink: () => "https://explorer.example.com",
    hideToken: async () => {},
    showToken: async () => {},
    getTokenFee: () => BigInt(10000),
    getTokenFeeFormatted: () => "0.0001 CHAT",
    getTokenFeeFormattedUsd: async () => "0.10 USD",
    isHideable: () => true,
  },
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
        <TransferTemplate>
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
