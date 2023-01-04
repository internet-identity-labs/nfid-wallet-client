import { Meta, Story } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { VaultsWalletsTable, VaultsWalletsTableProps } from "./index"

const meta: Meta = {
  title: "Pages/VaultsWalletsTable",
  component: VaultsWalletsTable,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultsWalletsTableProps> = (args) => (
  <BrowserRouter>
    <VaultsWalletsTable wallets={args.wallets} />
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {
  wallets: [],
}
