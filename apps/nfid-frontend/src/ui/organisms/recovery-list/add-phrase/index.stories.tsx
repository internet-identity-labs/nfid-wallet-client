import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import AddRecoveryPhraseModal from "."

export default {
  title: "Organisms/AddRecoveryPhraseModal",
  component: AddRecoveryPhraseModal,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof AddRecoveryPhraseModal>

const ProtectModal: StoryFn<typeof AddRecoveryPhraseModal> = (args) => {
  return (
    <Router>
      <AddRecoveryPhraseModal {...args} />
    </Router>
  )
}

export const ProtectAppScreen = {
  render: ProtectModal,
  args: {},
}
