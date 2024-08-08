import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { ThirdPartyTemplate } from "../../templates/sdk-template"
import { IIAuthRecovery, AuthRecoveryIIProps } from "./index"

const meta: Meta = {
  title: "Pages/IIAuthRecovery",
  component: IIAuthRecovery,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<AuthRecoveryIIProps> = (args) => (
  <ThirdPartyTemplate>
    <IIAuthRecovery {...args} />
  </ThirdPartyTemplate>
)

export const Default = {
  render: Template,
  args: {},
}
