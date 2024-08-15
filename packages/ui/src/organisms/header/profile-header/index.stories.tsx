import { Meta, StoryFn } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { ProfileHeader, IProfileHeader } from "."

const meta: Meta = {
  title: "Organisms/Header/Header",
  component: ProfileHeader,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<IProfileHeader> = (args) => (
  <div className="px-[30px]">
    <Router>
      <ProfileHeader {...args} />
    </Router>
  </div>
)

Default.args = {
  anchor: 12345,
}
