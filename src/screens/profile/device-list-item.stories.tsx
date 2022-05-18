import { List } from "@internet-identity-labs/nfid-sdk-react"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import React from "react"

import { DeviceListItem } from "./device-list-item"

export default {
  title: "ScreensApp/Profile/DeviceListItem",
  component: DeviceListItem,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof DeviceListItem>

const Template: ComponentStory<typeof DeviceListItem> = (args) => (
  <List>
    <List.Header>Devices</List.Header>
    <List.Items>
      <DeviceListItem {...args} />
    </List.Items>
  </List>
)

export const Default = Template.bind({})
Default.args = {
  device: {
    label: "My device",
    icon: "desktop",
    pubkey: [123, 123],
  },
}
