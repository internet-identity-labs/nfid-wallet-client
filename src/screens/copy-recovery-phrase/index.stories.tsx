import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { CopyRecoveryPhrase } from "."

export default {
  title: "Screens/CopyRecoveryPhrase",
  component: CopyRecoveryPhrase,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof CopyRecoveryPhrase>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof CopyRecoveryPhrase
> = (args) => {
  return (
    <Router>
      <CopyRecoveryPhrase {...args} />
    </Router>
  )
}

export const IFrameScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

IFrameScreen.args = {
  applicationName: "OpenChat",
  recoveryPhrase:
    "1234567 dumb slender embrace pulp child immense draw sample tiger fix ozone salon social tenant word remain license boy practice tunnel enforce dice fence yard",
  continueButtonText: "Continue to OpenChat",
  successModalText:
    "Remember to keep your recovery phrase secret, safe, offline, and only use it on https://nfid.one",
}
