import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { UserPicture, UserPictureProps } from "."

const meta: Meta = {
  title: "Atoms/UserPicture",
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<UserPictureProps> = (args) => (
  <img src={UserPicture()} alt="avatar" />
)

export const Default = {
  render: Template,
  args: {},
}
