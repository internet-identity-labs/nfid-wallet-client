import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { TabsSwitcher } from "."

export default {
  title: "Organisms/TabsSwitcher",
  component: TabsSwitcher,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof TabsSwitcher>

const Template: StoryFn<typeof TabsSwitcher> = (args) => {
  return (
    <Router>
      <TabsSwitcher {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,

  args: {
    tabs: [
      {
        name: "Sent",
        title: <>Sent</>,
      },
      {
        name: "Received",
        title: <>Received</>,
      },
    ],
    isFitLine: true,
  },
}
