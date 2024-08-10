import { Meta, StoryFn } from "@storybook/react"

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
    <ProfileHeader {...args} />
  </div>
)

Default.args = {
  anchor: 12345,
}
