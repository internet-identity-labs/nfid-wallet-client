import { Meta, StoryFn } from "@storybook/react"

import { BlurredLoader } from "@nfid-frontend/ui"

import { SendReceiveModal, SendReceiveModalProps } from "."
import { TransferTemplate } from "./components/template"

const MockComponent = <div>Mock Component</div>

export default {
  title: "Organisms/Send Receive",
  component: SendReceiveModal,
  argTypes: {
    onClickOutside: { action: "clicked outside" },
    onTokenTypeChange: { action: "token type changed" },
    onModalTypeChange: { action: "modal type changed" },
  },
} as Meta

const Template: StoryFn<SendReceiveModalProps> = (args) => (
  <TransferTemplate>
    <SendReceiveModal {...args} />
  </TransferTemplate>
)

export const Default = Template.bind({})
Default.args = {
  isSuccess: false,
  direction: "send",
  tokenType: "ft",
  //component: MockComponent,
  onClickOutside: () => {},
  onTokenTypeChange: (isNFT) => console.log(isNFT),
  onModalTypeChange: (value) => console.log(value),
}

// export const Success = Template.bind({})
// Success.args = {
//   isSuccess: true,
//   direction: "receive",
//   tokenType: "nft",
//   //component: MockComponent,
//   onClickOutside: () => {},
//   onTokenTypeChange: (isNFT) => console.log(isNFT),
//   onModalTypeChange: (value) => console.log(value),
// }
