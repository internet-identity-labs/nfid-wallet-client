import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileContainer from "./Container"

export default {
  title: "Templates/ProfileContainer",
  component: ProfileContainer,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as Meta<typeof ProfileContainer>

const ProfileWrapper: StoryFn<typeof ProfileContainer> = (args) => {
  return (
    <Router>
      <ProfileContainer {...args} />
    </Router>
  )
}

export const ProfileScreen = {
  render: ProfileWrapper,

  args: {
    title: "Authorized devices",
    subTitle: "Where you can sign in from",
    children: <div>content here</div>,
  },
}
