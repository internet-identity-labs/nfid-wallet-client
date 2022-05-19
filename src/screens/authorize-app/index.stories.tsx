import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { AuthorizeApp } from "."

export default {
  title: "Screens/AuthorizeApp",
  component: AuthorizeApp,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AuthorizeApp>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AuthorizeApp
> = (args) => {
  return (
    <Router>
      <AuthorizeApp {...args} />
    </Router>
  )
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

AppScreen.args = {}
