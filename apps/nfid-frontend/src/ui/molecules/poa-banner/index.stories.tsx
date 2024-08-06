import { Meta, StoryFn } from "@storybook/react"

import { PoaBanner as PoaBannerComponent } from "."

export default {
  title: "Molecules/PoaBanner",
  component: PoaBannerComponent,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as Meta<typeof PoaBannerComponent>

export const PoaBanner = {}
