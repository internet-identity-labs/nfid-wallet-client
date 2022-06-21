import { ComponentStory, ComponentMeta } from "@storybook/react"
import React from "react"
import { HelmetProvider } from "react-helmet-async"
import { BrowserRouter as Router } from "react-router-dom"

import logo from "frontend/assets/dfinity.svg"

import { AuthorizeDecider } from "."

export default {
  title: "Screens/AuthorizeAppUnknownDeviceNew",
  component: AuthorizeDecider,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AuthorizeDecider>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof AuthorizeDecider
> = ({
  onToggleAdvancedOptions,
  showAdvancedOptions: defaultShowAdvancedOptions,
  ...args
}) => {
  const [showAdvancedOptions, toggleShowAdvancedOptions] = React.useReducer(
    (state) => !state,
    !!defaultShowAdvancedOptions,
  )

  return (
    <HelmetProvider>
      <Router>
        <AuthorizeDecider
          onToggleAdvancedOptions={toggleShowAdvancedOptions}
          showAdvancedOptions={showAdvancedOptions}
          {...args}
        />
      </Router>
    </HelmetProvider>
  )
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

AppScreen.args = {
  applicationName: "My Application",
  applicationLogo: logo,
  url: "https://nfid.one/secret/scope/my-application",
  isLoading: false,
  registerDeviceDeciderPath: "/register-device-decider",
  showAdvancedOptions: false,
}
