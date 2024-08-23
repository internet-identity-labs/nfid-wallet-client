import { Meta, StoryFn } from "@storybook/react"

import { TransferFTUi, TransferFTUiProps } from "./send-ft"
import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Organisms/Send Receive/Send FT",
  component: TransferFTUi,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<TransferFTUiProps> = (args) => (
  <div className="w-[450px] h-[630px]">
    <TransferTemplate>
      <TransferFTUi {...args} />
    </TransferTemplate>
  </div>
)

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
}

Default.args = SendFTProps
