import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { AuthorizeRegisterDeciderScreen } from "."

export default {
  title: "Screens/AuthorizeRegisterDecider",
  component: AuthorizeRegisterDeciderScreen,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AuthorizeRegisterDeciderScreen>

const RegisterDeviceDeciderTemplate: ComponentStory<
  typeof AuthorizeRegisterDeciderScreen
> = (args) => {
  return (
    <Router>
      <AuthorizeRegisterDeciderScreen {...args} />
    </Router>
  )
}

export const ResponsiveScreen = RegisterDeviceDeciderTemplate.bind({})

ResponsiveScreen.args = {}
