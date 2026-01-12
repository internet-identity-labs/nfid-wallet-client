import { Meta, StoryFn } from "@storybook/react"
import { ToggleButton } from "packages/ui/src/molecules/toggle-button"

import { SendStatus } from "frontend/features/transfer-modal/types"

import { TransferNFTUi, TransferNFTUiProps } from "./send-nft"
import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Organisms/Send Receive Swap/Send NFT",
  component: TransferNFTUi,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<TransferNFTUiProps> = (args) => (
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
  nfts: undefined,
  nftOptions: [],
  selectedNFTId: "",
  selectedNFT: undefined,
  selectedReceiverWallet: "",
  selectedAccountAddress:
    "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
  balance: 200000,
  setSelectedNFTId: (value: string | ((prevState: string) => string)) => {},
  submit: async () => {
    return undefined
  },
  validateAddress: () => true,
  isSuccessOpen: false,
  onClose: () => {},
  status: SendStatus.PENDING,
}

SendNFT.args = SendNFTProps
