import { Meta, StoryFn } from "@storybook/react"
import { ToggleButton } from "packages/ui/src/molecules/toggle-button"

import { TransferNFTUi, TransferNFTUiProps } from "./send-nft"
import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Organisms/Send Receive/Send NFT",
  component: TransferNFTUi,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<TransferNFTUiProps> = (args) => (
  <div className="w-[450px] h-[630px]">
    <TransferTemplate>
      <div className="leading-10 text-[20px] font-bold first-letter:capitalize mb-[18px]">
        Send
      </div>
      <ToggleButton
        firstValue="Token"
        secondValue="Collectible"
        className="mb-5"
        onChange={() => console.log(1)}
        defaultValue={true}
        id="send_type_toggle"
      />
      <TransferNFTUi {...args} />
    </TransferTemplate>
  </div>
)

export const SendNFT = Template.bind({})

export const SendNFTProps = {
  isLoading: false,
  isBalanceLoading: false,
  loadingMessage: "",
  nftOptions: [],
  selectedNFTId: "",
  selectedNFT: undefined,
  selectedConnector: undefined,
  selectedReceiverWallet: "",
  selectedAccountAddress:
    "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
  balance: 200000,
  setSelectedNFTId: (value: string | ((prevState: string) => string)) => {
    if (typeof value === "function") {
      const prevState = ""
      console.log(
        "Selected NFT ID:",
        (value as (prevState: string) => string)(prevState),
      )
    } else {
      console.log("Selected NFT ID:", value)
    }
  },
  submit: async () => {
    console.log("Send button clicked")
    return undefined
  },
  validateAddress: () => true,
}

SendNFT.args = SendNFTProps
