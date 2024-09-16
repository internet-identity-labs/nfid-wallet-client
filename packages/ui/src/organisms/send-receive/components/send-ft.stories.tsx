import { Meta, StoryFn } from "@storybook/react"
import { useForm } from "react-hook-form"

import { FT } from "frontend/integration/ft/ft"

import { TransferFTUi, TransferFTUiProps } from "./send-ft"
import { TransferTemplate } from "./template"

type FormFields = {
  amount: string
  to: string
}

const meta: Meta = {
  title: "Organisms/Send Receive/Send FT",
  component: TransferFTUi,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<TransferFTUiProps> = (args) => {
  const { register, setValue, handleSubmit, resetField, formState } =
    useForm<FormFields>({
      defaultValues: {
        amount: "",
        to: "",
      },
    })

  return (
    <div className="w-[450px] h-[630px]">
      <TransferTemplate isVault={false}>
        <TransferFTUi
          {...args}
          register={register}
          setValue={setValue}
          handleSubmit={handleSubmit}
          resetField={resetField}
          errors={formState.errors}
        />
      </TransferTemplate>
    </div>
  )
}

export const Default = Template.bind({})

export const SendFTProps = {
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
  selectedConnector: [] as any,
  selectedTokenCurrency: "ICP",
  selectedTokenBlockchain: "Internet Computer",
  sendReceiveTrackingFn: () => console.log("Tracking send/receive"),
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
  submit: async () => {
    console.log("Send button clicked")
  },
  setChosenToken: () => {},
  validateAddress: () => true,
  tokens: [] as FT[],
  token: { getTokenAddress } as FT,
  selectedVaultsAccountAddress: "",
  setSelectedVaultsAccountAddress: () => "",
  setUsdAmount: () => {},
}

Default.args = SendFTProps
