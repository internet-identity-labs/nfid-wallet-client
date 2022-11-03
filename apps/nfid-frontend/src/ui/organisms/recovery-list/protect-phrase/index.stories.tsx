import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import RecoveryPhraseProtectModal from "./phrase-protect-modal"

export default {
  title: "Organisms/RecoveryPhraseProtectModal",
  component: RecoveryPhraseProtectModal,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof RecoveryPhraseProtectModal>

const ProtectModal: ComponentStory<typeof RecoveryPhraseProtectModal> = (
  args,
) => {
  return (
    <Router>
      <RecoveryPhraseProtectModal {...args} />
    </Router>
  )
}

export const ProtectAppScreen = ProtectModal.bind({})

ProtectAppScreen.args = {}
