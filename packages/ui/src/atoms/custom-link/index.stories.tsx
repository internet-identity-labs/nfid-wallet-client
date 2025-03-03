import { Meta, StoryFn } from "@storybook/react"

import { CustomLink, CustomLinkProps } from "."

export default {
  title: "Components/ExternalLink",
  component: CustomLink,
  argTypes: {
    link: { control: "text" },
    text: { control: "text" },
    id: { control: "text" },
    classNames: { control: "text" },
    withIcon: { control: "boolean" },
  },
} as Meta

const Template: StoryFn<CustomLinkProps> = (args) => <CustomLink {...args} />

export const Default = Template.bind({})
Default.args = {
  link: "https://example.com",
  text: "Visit Example",
}

export const WithIcon = Template.bind({})
WithIcon.args = {
  link: "https://example.com",
  text: "Visit Example with Icon",
  withIcon: true,
}

export const CustomClassNames = Template.bind({})
CustomClassNames.args = {
  link: "https://example.com",
  text: "Visit Custom Styled Example",
  classNames: "text-blue-500 font-semibold",
}
