import { Meta, StoryFn } from "@storybook/react"

import { SuccessProps, Success } from "./success"
import { TransferTemplate } from "./template"

const meta: Meta = {
  title: "Organisms/Send Receive Swap/Send Success",
  component: Success,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<SuccessProps> = (args) => (
  <div className="w-[450px] h-[630px]">
    <TransferTemplate>
      <Success {...args} />
    </TransferTemplate>
  </div>
)

export const Default = Template.bind({})

Default.args = {
  title: "1.0047 ICP",
  subTitle: "1,866.24 USD",
  duration: "2 seconds",
}
