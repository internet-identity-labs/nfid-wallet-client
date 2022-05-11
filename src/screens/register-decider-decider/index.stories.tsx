import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { RegisterDeviceDecider } from "."
import { AppScreenRegisterDevice } from "./screen-app"

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
  typeof AppScreenRegisterDevice
> = (args) => {
  return (
    <Router>
      <AppScreenRegisterDevice {...args} />
    </Router>
  )
}

export const Raw = RegisterDeviceDeciderTemplate.bind({})

Raw.args = {}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})
