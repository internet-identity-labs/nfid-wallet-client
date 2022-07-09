import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { VerifyPhoneNumberRoute } from "./router"

export default {
  title: "Flows/VerifyPhoneNumber",
  component: VerifyPhoneNumberRoute,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof VerifyPhoneNumberRoute>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof VerifyPhoneNumberRoute
> = (args) => {
  return (
    <Router>
      <VerifyPhoneNumberRoute {...args} />
    </Router>
  )
}

export const ResponsiveScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

ResponsiveScreen.args = {}
