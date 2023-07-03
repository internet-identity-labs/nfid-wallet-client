import { ComponentStory, ComponentMeta } from "@storybook/react"
import React from "react"

import { Icon } from "@nfid/integration"

import { List } from "frontend/ui/molecules/list"

import { DeviceListItem } from "./device-list-item"

export default {
  title: "Organisms/NewProfile/DeviceListItem",
  component: DeviceListItem,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof DeviceListItem>

const Template: ComponentStory<typeof DeviceListItem> = (args) => (
  <List>
    <List.Items>
      <DeviceListItem {...args} />
    </List.Items>
  </List>
)

export const Default = Template.bind({})
Default.args = {
  device: {
    label: "My device",
    browser: "Chrome",
    icon: Icon.desktop,
    lastUsed: Date.now(),
    pubkey: [123, 123],
  },
}
