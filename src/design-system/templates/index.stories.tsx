import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { ScreenResponsive } from "./screen-responsive"

export default {
  title: "Templates/IFrame",
  component: ScreenResponsive,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ScreenResponsive>

const IFrameScreen: ComponentStory<typeof ScreenResponsive> = (args) => {
  return (
    <Router>
      <ScreenResponsive {...args} />
    </Router>
  )
}

export const IFrameWrapper = IFrameScreen.bind({})

IFrameWrapper.args = {
  children: <h2 className="text-center">Hello world</h2>,
}
