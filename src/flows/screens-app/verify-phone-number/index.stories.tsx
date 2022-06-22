import { ComponentStory, ComponentMeta } from "@storybook/react"

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
  return <VerifyPhoneNumberRoute {...args} />
}

export const ResponsiveScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

ResponsiveScreen.args = {}
