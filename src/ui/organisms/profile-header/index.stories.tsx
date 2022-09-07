import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileHeader from "."

export default {
  title: "Organisms/NewProfile/Header",
  component: ProfileHeader,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ProfileHeader>

const Template: ComponentStory<typeof ProfileHeader> = (args) => {
  return (
    <Router>
      <ProfileHeader {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  anchor: 10089,
}
