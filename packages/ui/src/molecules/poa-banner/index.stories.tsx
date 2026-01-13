import { Meta } from "@storybook/react"

import { PoaBanner as PoaBannerComponent } from "."

export default {
  title: "Molecules/PoaBanner",
  component: PoaBannerComponent,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof PoaBannerComponent>

export const PoaBanner = {}
