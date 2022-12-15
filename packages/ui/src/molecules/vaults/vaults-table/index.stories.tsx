import { Meta, Story } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { VaultsTable, VaultsTableProps } from "./index"

const meta: Meta = {
  title: "Pages/VaultsTable",
  component: VaultsTable,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultsTableProps> = (args) => (
  <BrowserRouter>
    <VaultsTable vaults={args.vaults} />
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {
  vaults: [
    {
      createdDate: new Date().getTimezoneOffset(),
      modifiedDate: new Date().getTimezoneOffset(),
      id: new Date().getTimezoneOffset(),
      name: "Yumi vault first",
      description: undefined,
      members: [
        {
          name: undefined,
          userId: "dasdasd",
          role: 0,
          state: new Date().getTimezoneOffset(),
        },
      ],
      policies: [new Date().getTimezoneOffset(), 2, 3] as any,
      wallets: [new Date().getTimezoneOffset(), 2, 3] as any,
    },
  ],
}
