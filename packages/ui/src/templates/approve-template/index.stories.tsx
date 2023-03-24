import { Meta, Story } from "@storybook/react"
import { withRouter } from "storybook-addon-react-router-v6"

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

const Template: Story<ApproveTemplateProps> = (args) => (
  <ApproveTemplate {...args} />
)

export const Default = Template.bind({})

Default.args = {
  children: <div>123</div>,
  applicationName: "NFID Demo",
  successTimer: -1,
  isLoading: true,
}
