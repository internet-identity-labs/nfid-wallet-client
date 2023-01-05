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
  vaults: [],
}
