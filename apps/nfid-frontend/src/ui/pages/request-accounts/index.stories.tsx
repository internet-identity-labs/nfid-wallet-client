import { Meta, Story } from "@storybook/react"

import logo from "frontend/assets/distrikt.svg"

import { SDKRequestAccountsPage, SDKRequestAccountsPageProps } from "./index"

const meta: Meta = {
  title: "Pages/SDKRequestAccountsPage",
  component: SDKRequestAccountsPage,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<SDKRequestAccountsPageProps> = (args) => (
  <SDKRequestAccountsPage {...args} />
)

export const Default = Template.bind({})

Default.args = {
  applicationName: "My Application",
  applicationLogo: logo,
  accountsOptions: [],
}
