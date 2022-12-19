import { Meta, Story } from "@storybook/react"

import { IconCmpArrowRight } from "@nfid-frontend/ui"

import Table, { TableProps } from "."
import { TableCell } from "./table-cell"
import { TableRow } from "./table-row"

const meta: Meta = {
  title: "Molecules/Table",
  component: Table,
  parameters: {},
}

export default meta

const DefaultTemplate: Story<TableProps> = (args) => (
  <Table
    tableHeader={
      <TableRow className="font-bold border-black">
        <TableCell isLeft className="w-auto">
          Name
        </TableCell>
        <TableCell centered>Wallets</TableCell>
        <TableCell centered>Members</TableCell>
        <TableCell className="w-52">Last activity</TableCell>
        <TableCell isRight />
      </TableRow>
    }
  >
    <TableRow onClick={() => {}}>
      <TableCell isLeft>Some title</TableCell>
      <TableCell centered>1</TableCell>
      <TableCell centered>2</TableCell>
      <TableCell>Some date</TableCell>
      <TableCell isRight>
        <IconCmpArrowRight className="text-gray-400" />
      </TableCell>
    </TableRow>
  </Table>
)

export const Default = DefaultTemplate.bind({})
