import { StoryFn, Meta } from "@storybook/react-webpack5"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileTemplate from "./Template"

const Icon = undefined

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
