import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { Separator } from "."

const meta: Meta = {
  title: "Atoms/Separator",
  component: Separator,
  argTypes: {},
}

export default meta

export const Default = {
  args: {
    placeholder: "Placeholder",
    errorText: "",
  },
}
