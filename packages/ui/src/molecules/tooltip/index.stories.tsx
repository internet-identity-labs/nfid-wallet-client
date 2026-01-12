import type { Meta } from "@storybook/react"

import { Tooltip } from "."

const Story: Meta<typeof Tooltip> = {
  component: Tooltip,
  title: "molecules/Tooltip",
}
export default Story

export const Primary = {
  args: {
    tip: "Copy to clipboard",
    children: <div>Hover me</div>,
  },
}

export const WithHtml = {
  args: {
    tip: (
      <div>
        Copy to clipboard
        <br />
        to proceed
      </div>
    ),
    children: <div>Hover me</div>,
  },
}
