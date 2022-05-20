import { ComponentStory, ComponentMeta } from "@storybook/react"

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
  return <AuthorizeApp {...args} />
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

AppScreen.args = {
  applicationName: "My Application",
  accounts: [
    { persona_id: "1", domain: "https://my-app.ic0.app" },
    { persona_id: "2", domain: "https://my-app.ic0.app" },
    { persona_id: "3", domain: "https://my-app.ic0.app" },
  ],
}
