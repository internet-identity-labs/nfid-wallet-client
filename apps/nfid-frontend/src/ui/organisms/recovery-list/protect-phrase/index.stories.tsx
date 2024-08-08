import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import RecoveryPhraseProtectModal from "./phrase-protect-modal"

export default {
  title: "Organisms/RecoveryPhraseProtectModal",
  component: RecoveryPhraseProtectModal,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof RecoveryPhraseProtectModal>

const ProtectModal: StoryFn<typeof RecoveryPhraseProtectModal> = (args) => {
  return (
    <Router>
      <RecoveryPhraseProtectModal {...args} />
    </Router>
  )
}

export const ProtectAppScreen = {
  render: ProtectModal,
  args: {},
}
