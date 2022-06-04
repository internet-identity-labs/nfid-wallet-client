import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { IFrameRegisterDeviceDecider } from "./screen-iframe"

export default {
  title: "Screens/RegisterDeviceDecider",
  component: IFrameRegisterDeviceDecider,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof IFrameRegisterDeviceDecider>

const AppScreenRegisterDeviceDeciderTemplate: ComponentStory<
  typeof IFrameRegisterDeviceDecider
> = (args) => {
  return (
    <Router>
      <IFrameRegisterDeviceDecider {...args} />
    </Router>
  )
}

export const IFrameScreen = AppScreenRegisterDeviceDeciderTemplate.bind({})

IFrameScreen.args = {}
