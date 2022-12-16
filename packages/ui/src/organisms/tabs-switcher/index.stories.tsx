import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { TabsSwitcher } from "."

export default {
  title: "Organisms/TabsSwitcher",
  component: TabsSwitcher,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof TabsSwitcher>

const Template: ComponentStory<typeof TabsSwitcher> = (args) => {
  return (
    <Router>
      <TabsSwitcher {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
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
}
