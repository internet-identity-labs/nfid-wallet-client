import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileSidebar from "."

export default {
  title: "Organisms/NewProfile/Sidebar",
  component: ProfileSidebar,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof ProfileSidebar>

const Template: StoryFn<typeof ProfileSidebar> = (args) => {
  return (
    <Router>
      <ProfileSidebar {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,
  args: {},
}
