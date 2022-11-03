import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileContainer from "./Container"

export default {
  title: "Templates/ProfileContainer",
  component: ProfileContainer,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ProfileContainer>

const ProfileWrapper: ComponentStory<typeof ProfileContainer> = (args) => {
  return (
    <Router>
      <ProfileContainer {...args} />
    </Router>
  )
}

export const ProfileScreen = ProfileWrapper.bind({})

ProfileScreen.args = {
  title: "Authorized devices",
  subTitle: "Where you can sign in from",
  children: <div>content here</div>,
}
