import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileCopyPhrasePage from "."

export default {
  title: "Screens/ProfileCopyPhrasePage",
  component: ProfileCopyPhrasePage,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as Meta<typeof ProfileCopyPhrasePage>

const AppScreenRegisterDeviceDeciderTemplate: StoryFn<
  typeof ProfileCopyPhrasePage
> = (args: any) => {
  return (
    <Router>
      <ProfileCopyPhrasePage {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: AppScreenRegisterDeviceDeciderTemplate,

  args: {
    recoveryPhrase:
      "1234567 dumb slender embrace pulp child immense draw sample tiger fix ozone salon social tenant word remain license boy practice tunnel enforce dice fence yard",
    continueButtonText: "Continue to OpenChat",
  },
}
