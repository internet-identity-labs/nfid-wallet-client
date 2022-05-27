import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { IFrameTemplate } from "./IFrameTemplate"

export default {
  title: "Templates/IFrame",
  component: IFrameTemplate,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof IFrameTemplate>

const IFrameScreen: ComponentStory<typeof IFrameTemplate> = (args) => {
  return (
    <Router>
      <IFrameTemplate {...args} />
    </Router>
  )
}

export const IFrameWrapper = IFrameScreen.bind({})

IFrameWrapper.args = {
  children: <h2 className="text-center">Hello world</h2>,
}
