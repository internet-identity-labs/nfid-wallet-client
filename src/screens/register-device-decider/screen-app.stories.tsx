import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { AppScreenRegisterDeviceDecider } from "../../flows/screens-app/authenticate/screen-app-register-device-decider"

export default {
  title: "Screens/RegisterDeviceDecider",
  component: AppScreenRegisterDeviceDecider,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AppScreenRegisterDeviceDecider>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AppScreenRegisterDeviceDecider
> = (args) => {
  return (
    <Router>
      <AppScreenRegisterDeviceDecider {...args} />
    </Router>
  )
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

AppScreen.args = {}
