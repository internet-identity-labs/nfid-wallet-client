import { Meta, Story } from "@storybook/react"

import { SDKTemplate } from "../../templates/sdk-template"
import { IIAuthComplete, IIAuthCompleteProps } from "./index"

const meta: Meta = {
  title: "Pages/IIAuthComplete",
  component: IIAuthComplete,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: Story<IIAuthCompleteProps> = (args) => (
  <SDKTemplate>
    <IIAuthComplete {...args} />
  </SDKTemplate>
)

export const Default = Template.bind({})

Default.args = {}
