import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import Icon from "../../pages/new-profile/assets/book-open.svg"

import ProfileTemplate from "./Template"

export default {
  title: "Templates/ProfileTemplate",
  component: ProfileTemplate,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as Meta<typeof ProfileTemplate>

const ProfileWrapper: StoryFn<typeof ProfileTemplate> = (args) => {
  return (
    <Router>
      <ProfileTemplate {...args} />
    </Router>
  )
}

export const ProfileScreen = {
  render: ProfileWrapper,

  args: {
    pageTitle: "Assets",
    icon: Icon,
    onIconClick: () => {},
    children: <div>content here</div>,
  },
}
