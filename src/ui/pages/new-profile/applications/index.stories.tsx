import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { applicationAccountDetailsNormalized } from "frontend/apps/identity-manager/profile/applications/utils/index.mock"

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
  applications: applicationAccountDetailsNormalized,
}
