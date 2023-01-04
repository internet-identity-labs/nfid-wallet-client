import { Meta, Story } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { VaultsMembersTable, VaultsMembersTableProps } from "./index"

const meta: Meta = {
  title: "Pages/VaultsMembersTable",
  component: VaultsMembersTable,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultsMembersTableProps> = (args) => (
  <BrowserRouter>
    <VaultsMembersTable members={args.members} />
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {
  members: [
    {
      id: 1,
      name: "Brooklyn Simmons",
      role: "Admin",
      address: "laksdkasd...qqw",
    },
  ],
}
