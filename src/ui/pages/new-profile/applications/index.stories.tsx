import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import Index from "."

export default {
  title: "Screens/NewProfile/Applications",
  component: Index,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Index>

const Template: ComponentStory<typeof Index> = (args) => {
  return (
    <Router>
      <Index {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  applications: [
    {
      label: "123",
      domain: "wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app",
      accountId: "1",
    },
    {
      label: "123",
      domain: "https://wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app",
      accountId: "2",
    },
    { label: "123", domain: "https://dscvr.one", accountId: "1" },
  ],
}
