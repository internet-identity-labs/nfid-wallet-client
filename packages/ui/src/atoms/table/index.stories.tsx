import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import Table from "."

const meta: Meta = {
  title: "Atoms/Table",
  component: Table,
  parameters: {},
}

export default meta

const DefaultTemplate: StoryFn<{}> = (_args) => (
  <Table
    headings={["Make", "Model", "Year", "Color"]}
    rows={[
      { key: "0", val: ["Mazda", "Miata", "2004", "Silver"] },
      { key: "1", val: ["Volkswagon", "GTI", "2015", "Dark Gray"] },
    ]}
    handleHeaderClick={() => {}}
  />
)

export const Default = {
  render: DefaultTemplate,
}
