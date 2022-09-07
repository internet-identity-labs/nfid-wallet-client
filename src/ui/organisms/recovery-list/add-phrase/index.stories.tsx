import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import AddRecoveryPhraseModal from "."

export default {
  title: "Organisms/AddRecoveryPhraseModal",
  component: AddRecoveryPhraseModal,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AddRecoveryPhraseModal>

const ProtectModal: ComponentStory<typeof AddRecoveryPhraseModal> = (args) => {
  return (
    <Router>
      <AddRecoveryPhraseModal {...args} />
    </Router>
  )
}

export const ProtectAppScreen = ProtectModal.bind({})

ProtectAppScreen.args = {}
