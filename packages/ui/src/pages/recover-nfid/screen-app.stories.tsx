import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { RecoverNFID } from "."

export default {
  title: "Screens/RecoverNFID",
  component: RecoverNFID,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as Meta<typeof RecoverNFID>

const Template: StoryFn<typeof RecoverNFID> = (args) => {
  return (
    <Router>
      <RecoverNFID {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,
  args: {},
}
