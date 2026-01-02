import { Meta, StoryFn } from "@storybook/react"

import { ReceiveProps, Receive } from "./receive"
import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Organisms/Send Receive Swap/Receive",
  component: Receive,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<ReceiveProps> = (args) => (
  <div className="w-[450px] h-[630px]">
    <TransferTemplate isOpen={true}>
      <Receive {...args} />
    </TransferTemplate>
  </div>
)

export const Default = Template.bind({})

export const ReceiveUiProps = {
  selectedAccountAddress:
    "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
  address: "25385036304989de660c9aff135e3ebea5ab906b08eac4cbfe4621fa9be4d1d9",
  accountsOptions: [
    {
      label: "NFID",
      options: [
        {
          badgeText: "WALLET",
          innerTitle: "20000000 ICP",
          subTitle: "253850...d1d9",
          title: "NFID",
          value:
            "yrfx6-fmprd-wgad6-6or6b-2aw42-5qqhn-o4yt7-plkxr-2jtgv-azhzx-gae",
        },
      ],
    },
  ],
  isVault: false,
  isAccountsValidating: false,
  setSelectedAccountAddress: () => {},
  isLoading: false,
}

Default.args = ReceiveUiProps
