import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { AuthorizeRegisterDeciderScreen } from "."

export default {
  title: "Screens/AuthorizeRegisterDeciderScreen",
  component: AuthorizeRegisterDeciderScreen,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AuthorizeRegisterDeciderScreen>

const RegisterDeviceDeciderTemplate: ComponentStory<
  typeof AuthorizeRegisterDeciderScreen
> = (args) => {
  return <AuthorizeRegisterDeciderScreen {...args} />
}

export const Raw = RegisterDeviceDeciderTemplate.bind({})

Raw.args = {}
