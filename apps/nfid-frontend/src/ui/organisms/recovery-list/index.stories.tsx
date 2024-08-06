import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import RecoveryPhraseDeleteModal from "./phrase-delete-modal"

export default {
  title: "Organisms/RecoveryPhraseDeleteModal",
  component: RecoveryPhraseDeleteModal,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof RecoveryPhraseDeleteModal>

const Template: StoryFn<typeof RecoveryPhraseDeleteModal> = (args) => {
  return (
    <Router>
      <RecoveryPhraseDeleteModal {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,
  args: {},
}
