import { Meta, Story } from "@storybook/react"

import { ThirdPartyTemplate } from "../../templates/sdk-template"
import { IIAuthConnect, AuthConnectIIProps } from "./index"

const meta: Meta = {
  title: "Pages/IIAuthConnect",
  component: IIAuthConnect,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const ConnectIITemplate: Story<AuthConnectIIProps> = (args) => (
  <ThirdPartyTemplate>
    <IIAuthConnect {...args} />
  </ThirdPartyTemplate>
)

export const StateConnectII = ConnectIITemplate.bind({})

StateConnectII.args = {}
