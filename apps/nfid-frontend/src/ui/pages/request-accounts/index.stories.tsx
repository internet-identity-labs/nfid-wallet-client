import { Meta, StoryFn } from "@storybook/react"

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

export const Default = {
  args: {
    applicationName: "My Application",
    applicationLogo: logo,
    accountsOptions: [],
  },
}
