import { Meta, StoryFn } from "@storybook/react"

import { A, AProps } from "."

export default {
  title: "Components/A",
  component: A,
  argTypes: {
    children: { control: "text" },
    href: { control: "text" },
    className: { control: "text" },
    withGapBetweenChildren: { control: "boolean" },
    onClick: { action: "clicked" },
  },
} as Meta<AProps>

const Template: StoryFn<AProps> = (args) => <A {...args} />

export const Default = Template.bind({})
Default.args = {
  children: "Default Link",
  href: "https://example.com",
}

export const WithGap = Template.bind({})
WithGap.args = {
  children: "Link with Gap",
  href: "https://example.com",
  withGapBetweenChildren: true,
}

export const CustomStyles = Template.bind({})
CustomStyles.args = {
  children: "Custom Styled Link",
  href: "https://example.com",
  className: "text-red-500 font-bold",
}

export const Clickable = Template.bind({})
Clickable.args = {
  children: "Clickable Link",
  href: "#",
  onClick: () => console.log("Link clicked!"),
}
