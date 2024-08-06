import { Meta, StoryFn } from "@storybook/react"

import { Badge, IBadge } from "."

const meta: Meta = {
  title: "Atoms/Badge",
  argTypes: {
    children: {
      control: {
        type: "text",
        default: "Pending",
      },
      defaultValue: "Pending",
    },
    type: {
      options: ["warning", "success", "error", "cancel"],
      control: { type: "radio" },
      defaultValue: "warning",
    },
  },
}

export default meta

const BadgeComponent: StoryFn<IBadge> = (args) => {
  return <Badge type={args.type}>{args.children}</Badge>
}

export const Overview = BadgeComponent.bind({
  type: "warning",
})
