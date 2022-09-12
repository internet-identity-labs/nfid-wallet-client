import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { AppScreenRegisterDevice } from "./screen-app"

export default {
  title: "Screens/RegisterDevice",
  component: AppScreenRegisterDevice,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AppScreenRegisterDevice>

const Template: ComponentStory<typeof AppScreenRegisterDevice> = (args) => {
  return (
    <Router>
      <AppScreenRegisterDevice {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {}
