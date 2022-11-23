import type { ComponentStory, ComponentMeta } from "@storybook/react"

import { Tooltip } from "./tooltip"

const Story: ComponentMeta<typeof Tooltip> = {
  component: Tooltip,
  title: "molecules/Tooltip",
}
export default Story

const Template: ComponentStory<typeof Tooltip> = (args) => <Tooltip {...args} />

export const Primary = Template.bind({})
Primary.args = {
  tip: "Copy to clipboard",
  children: <div>Hover me</div>,
}

export const WithHtml = Template.bind({})
WithHtml.args = {
  tip: (
    <div>
      Copy to clipboard
      <br />
      to proceed
    </div>
  ),
  children: <div>Hover me</div>,
}
