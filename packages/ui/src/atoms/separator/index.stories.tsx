import { Meta } from "@storybook/react"

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
