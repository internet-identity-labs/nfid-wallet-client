import { ComponentMeta, ComponentStory } from "@storybook/react"

import { PoaBanner as PoaBannerComponent } from "."

export default {
  title: "Molecules/PoaBanner",
  component: PoaBannerComponent,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof PoaBannerComponent>

const Template: ComponentStory<typeof PoaBannerComponent> = (args) => (
  <PoaBannerComponent {...args} />
)

export const PoaBanner = Template.bind({})
