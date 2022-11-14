import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileCopyPhrasePage from "."

export default {
  title: "Screens/ProfileCopyPhrasePage",
  component: ProfileCopyPhrasePage,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ProfileCopyPhrasePage>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof ProfileCopyPhrasePage
> = (args: any) => {
  return (
    <Router>
      <ProfileCopyPhrasePage {...args} />
    </Router>
  )
}

export const AppScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

AppScreen.args = {
  recoveryPhrase:
    "1234567 dumb slender embrace pulp child immense draw sample tiger fix ozone salon social tenant word remain license boy practice tunnel enforce dice fence yard",
  continueButtonText: "Continue to OpenChat",
}
