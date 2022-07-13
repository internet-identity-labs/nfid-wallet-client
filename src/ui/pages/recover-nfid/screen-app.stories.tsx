import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { AppScreenRecoverNFID } from "./screen-app"

export default {
  title: "Screens/RecoverNFID",
  component: AppScreenRecoverNFID,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof AppScreenRecoverNFID>

const Template: ComponentStory<typeof AppScreenRecoverNFID> = (args) => {
  return (
    <Router>
      <AppScreenRecoverNFID {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {}
