import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileHeader from "."

export default {
  title: "Organisms/NewProfile/Header",
  component: ProfileHeader,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof ProfileHeader>

const Template: StoryFn<typeof ProfileHeader> = (args) => {
  return (
    <Router>
      <ProfileHeader {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,

  args: {
    anchor: 10089,
  },
}
