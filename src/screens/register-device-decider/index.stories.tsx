import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { RegisterDeviceDecider } from "."
import { AppScreenRegisterDeviceDecider } from "../../flows/screens-app/authenticate/screen-app-register-device-decider"

export default {
  title: "Screens/RegisterDeviceDecider",
  component: RegisterDeviceDecider,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof RegisterDeviceDecider>

const RegisterDeviceDeciderTemplate: ComponentStory<
  typeof RegisterDeviceDecider
> = (args) => {
  return <RegisterDeviceDecider {...args} />
}

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AppScreenRegisterDeviceDecider
> = (args) => {
  return (
    <Router>
      <AppScreenRegisterDeviceDecider {...args} />
    </Router>
  )
}

export const Raw = RegisterDeviceDeciderTemplate.bind({})

Raw.args = {}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})
