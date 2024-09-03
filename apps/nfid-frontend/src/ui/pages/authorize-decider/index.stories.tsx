import { StoryFn, Meta } from "@storybook/react"
import { CredentialResponse } from "packages/ui/src/molecules/button/signin-with-google/types"
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
} as Meta<typeof AuthorizeDecider>

const AppScreenRegisterDeviceDeciderTemplate: StoryFn<
  typeof AuthorizeDecider
> = ({
  onToggleAdvancedOptions,
  showAdvancedOptions: defaultShowAdvancedOptions,
  ...args
}: any) => {
  const [showAdvancedOptions, toggleShowAdvancedOptions] = React.useReducer(
    (state) => !state,
    !!defaultShowAdvancedOptions,
  )

  return (
    <HelmetProvider>
      <Router>
        <AuthorizeDecider
          onSelectRemoteAuthorization={function (): void | Promise<void> {
            throw new Error("Function not implemented.")
          }}
          onSelectSameDeviceAuthorization={function (
            userNumber: number,
          ): void | Promise<void> {
            throw new Error("Function not implemented.")
          }}
          onSelectSecurityKeyAuthorization={function (
            userNumber: number,
          ): void | Promise<void> {
            throw new Error("Function not implemented.")
          }}
          onSelectGoogleAuthorization={function ({
            credential,
          }: CredentialResponse): void {
            throw new Error("Function not implemented.")
          }}
          onToggleAdvancedOptions={toggleShowAdvancedOptions}
          showAdvancedOptions={showAdvancedOptions}
          {...args}
        />
      </Router>
    </HelmetProvider>
  )
}

export const AppScreen = {
  render: AppScreenRegisterDeviceDeciderTemplate,

  args: {
    applicationName: "My Application",
    applicationLogo: logo,
    isLoading: false,
    showAdvancedOptions: false,
  },
}
