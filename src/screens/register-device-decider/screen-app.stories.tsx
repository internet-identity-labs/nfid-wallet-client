import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { AppScreenRegisterDevice } from "../../flows/screens-app/authenticate/screen-app-register-device-decider"

export default {
  title: "Screens/RegisterDeviceDecider",
  component: AppScreenRegisterDevice,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AppScreenRegisterDevice>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AppScreenRegisterDevice
> = (args) => {
  return (
    <Router>
      <AppScreenRegisterDevice {...args} />
    </Router>
  )
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

AppScreen.args = {}
