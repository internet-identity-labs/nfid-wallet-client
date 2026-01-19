import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { IFrameNFIDLogin } from "./screen-iframe"

export default {
  title: "Screens/NFIDLogin",
  component: IFrameNFIDLogin,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as Meta<typeof IFrameNFIDLogin>

const AppScreenRegisterDeviceDeciderTemplate: StoryFn<
  typeof IFrameNFIDLogin
> = (args) => {
  return (
    <Router>
      <IFrameNFIDLogin {...args} />
    </Router>
  )
}

export const IFrameScreen = {
  render: AppScreenRegisterDeviceDeciderTemplate,
  args: {},
}
