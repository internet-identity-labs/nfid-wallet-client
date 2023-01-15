import { ComponentMeta, ComponentStory } from "@storybook/react"

import { Switch } from "."

export default {
  title: "Atoms/Switch",
  component: Switch,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Switch>

const SwitchTemplate: ComponentStory<typeof Switch> = (args) => (
  <Switch onChange={args.onChange} />
)

export const SwitchComponent = SwitchTemplate.bind({ onChange: () => [] })
