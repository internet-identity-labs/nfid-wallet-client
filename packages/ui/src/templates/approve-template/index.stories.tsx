import { Meta, StoryFn } from "@storybook/react"
import { withRouter } from "storybook-addon-remix-react-router"

import { ApproveTemplate, ApproveTemplateProps } from "./index"

const meta: Meta = {
  title: "Templates/ApproveTemplate",
  component: ApproveTemplate,
  argTypes: {},
  decorators: [withRouter],
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const Default = {
  args: {
    children: <div>123</div>,
    applicationName: "NFID Demo",
    successTimer: -1,
    isLoading: true,
  },
}
