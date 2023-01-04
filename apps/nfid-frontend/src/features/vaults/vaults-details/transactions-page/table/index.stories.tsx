import { Meta, Story } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { VaultsTransactionsTable, VaultsTransactionsTableProps } from "./index"

const meta: Meta = {
  title: "Pages/VaultsTransactionsTable",
  component: VaultsTransactionsTable,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<VaultsTransactionsTableProps> = (args) => (
  <BrowserRouter>
    <VaultsTransactionsTable transactions={args.transactions} />
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {
  transactions: [],
}
