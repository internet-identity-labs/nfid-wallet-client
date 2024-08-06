import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { Accordion, AccordionProps } from "./index"

const meta: Meta = {
  title: "Atoms/Accordion",
  component: Accordion,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<AccordionProps> = (args) => (
  <div>
    <Accordion {...args} />
    <Accordion {...args} />
    <Accordion {...args} />
  </div>
)

export const Default = {
  render: Template,

  args: {
    title: "Example accordion title",
    details:
      "NFID is the most private, secure, and convenient way to sign in to third-party apps and websites using the devices you already own. When you see a Continue with NFID prompt on a participating app or website, it means you can set up an account using your NFID. No more usernames or passwords to manage, no more loss of privacy, and no more identity theft or theft of the cryptocurrency you’re holding.",
  },
}
