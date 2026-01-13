import { Principal } from "@dfinity/principal"
import { Meta, StoryFn } from "@storybook/react"

import { ToggleButton } from "@nfid/ui"
import { FormProvider, useForm } from "react-hook-form"

import { Category, State } from "@nfid/integration/token/icrc1/enum/enums"

import { FT } from "frontend/integration/ft/ft"

import { TransferFTUi, TransferFTUiProps } from "./send-ft"
import { TransferTemplate } from "./template"

type FormFields = {
  amount: string
  to: string
}

const meta: Meta = {
  title: "Organisms/Send Receive Swap/Send FT",
  component: TransferFTUi,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<TransferFTUiProps> = (args) => {
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
            Send
          </div>
          <ToggleButton
            firstValue="Token"
            secondValue="Collectible"
            className="mb-5"
            onChange={() => {}}
            defaultValue={false}
            id="send_type_toggle"
          />
          <TransferFTUi {...args} />
        </TransferTemplate>
      </div>
    </FormProvider>
  )
}

export const Default = Template.bind({})

export const SendFTProps: any = {
  isLoading: false,
  isBalanceLoading: false,
  isFeeLoading: false,
  loadingMessage: "Loading...",
  balance: 1000000000,
  rate: 1.0,
  decimals: 8,
  transferFee: 10000,
  preselectedTransferDestination: "",
  tokenMetadata: [] as any,
  tokenOptions: [] as any,
  setSelectedAccountAddress: () => {},
  selectedTokenCurrency: "ICP",
  selectedTokenBlockchain: "Internet Computer",
  isVault: false,
  selectedAccountAddress:
    "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
  amountInUSD: 10,
  accountsOptions: [],
  optionGroups: [],
  calculateFee: () => {},
  setUSDAmount: () => {},
  setSelectedCurrency: () => {},
  setSelectedBlockchain: () => {},
  submit: async () => {},
  setChosenToken: () => {},
  validateAddress: () => true,
  tokens: [] as FT[],
  token: {
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
  selectedVaultsAccountAddress: "",
  setSelectedVaultsAccountAddress: () => "",
  setUsdAmount: () => {},
}

Default.args = SendFTProps
