import { ComponentStory, ComponentMeta } from "@storybook/react"

import { TransferModal } from "."

export default {
  title: "Organisms/TransferModal",
  component: TransferModal,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof TransferModal>

const TransferModalPage: ComponentStory<typeof TransferModal> = (args) => {
  return (
    <div className="w-full h-screen bg-red-50">
      <TransferModal {...args} />
    </div>
  )
}

export const TransferModalTemplate = TransferModalPage.bind({
  isSuccess: false,
})

TransferModalTemplate.args = {}
