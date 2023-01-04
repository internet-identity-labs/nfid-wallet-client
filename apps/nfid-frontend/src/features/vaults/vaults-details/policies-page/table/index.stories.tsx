import { Meta, Story } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { VaultsPoliciesTable, VaultsPoliciesTableProps } from "./index"

const meta: Meta = {
  title: "Pages/VaultsPoliciesTable",
  component: VaultsPoliciesTable,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultsPoliciesTableProps> = (args) => (
  <BrowserRouter>
    <VaultsPoliciesTable policies={args.policies} />
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {
  policies: [],
}
