import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import AuthenticatedPopup from "."

export default {
  title: "Organisms/HeaderPopup",
  component: AuthenticatedPopup,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AuthenticatedPopup>

const Template: ComponentStory<typeof AuthenticatedPopup> = (args) => {
  return (
    <Router>
      <AuthenticatedPopup {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  anchor: 10089,
}
