import { Meta } from "@storybook/react"

import { RadioButton } from "./index"

const meta: Meta = {
  title: "Molecules/RadioButton",
  component: RadioButton,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const Default = {
  args: {
    text: "Radio button",
    name: "name",
    id: "id",
  },
}
