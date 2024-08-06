import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import AuthenticatedPopup from "."

export default {
  title: "Organisms/HeaderPopup",
  component: AuthenticatedPopup,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof AuthenticatedPopup>

const Template: StoryFn<typeof AuthenticatedPopup> = (args) => {
  return (
    <Router>
      <AuthenticatedPopup {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,

  args: {
    anchor: 10089,
  },
}
