import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileSidebar from "."

export default {
  title: "Organisms/NewProfile/Sidebar",
  component: ProfileSidebar,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ProfileSidebar>

const Template: ComponentStory<typeof ProfileSidebar> = (args) => {
  return (
    <Router>
      <ProfileSidebar {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {}
