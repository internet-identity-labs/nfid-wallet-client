import { Meta, Story } from "@storybook/react"

import logo from "../../assets/id.svg"
import { SDKTemplate } from "../../templates/sdk-template"
import { IIAuthEntry, AuthWithIIProps } from "./index"

const meta: Meta = {
  title: "Pages/IIAuthEntry",
  component: IIAuthEntry,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const InitialTemplate: Story<AuthWithIIProps> = (args) => (
  <SDKTemplate>
    <IIAuthEntry {...args} />
  </SDKTemplate>
)

export const StateInitial = InitialTemplate.bind({})

StateInitial.args = {
  applicationName: "NFID",
  applicationLogo: logo,
}
