import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import RecoveryPhraseDeleteModal from "./phrase-delete-modal"

export default {
  title: "Organisms/RecoveryPhraseDeleteModal",
  component: RecoveryPhraseDeleteModal,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof RecoveryPhraseDeleteModal>

const Template: ComponentStory<typeof RecoveryPhraseDeleteModal> = (args) => {
  return (
    <Router>
      <RecoveryPhraseDeleteModal {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {}
