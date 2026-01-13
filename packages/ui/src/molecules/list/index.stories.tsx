import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { List } from "."
import { IconDesktop } from "../../atoms/icons/laptop"
import { H1 } from "../../atoms/typography"
import { ListItem } from "./list-item"

const meta: Meta = {
  title: "Molecules/List",
  component: List,
}

export default meta

const ListTemplate: StoryFn = (args) => (
  <div>
    <H1>Applications</H1>
    <List {...args}>
      <List.Header>My Header</List.Header>
      <List.Items>
        <ListItem
          title="One"
          subtitle="Item one subtitle"
          icon={
            <span className="text-xl font-medium text-blue">
              <IconDesktop />
            </span>
          }
        />
        <ListItem
          title="Two"
          subtitle="Item one subtitle"
          icon={
            <span className="text-xl font-medium text-blue">
              <IconDesktop />
            </span>
          }
        />
      </List.Items>
    </List>
  </div>
)

export const ListComponent = {
  render: ListTemplate,
  args: {},
}
