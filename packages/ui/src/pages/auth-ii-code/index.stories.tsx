import { Meta, StoryFn } from "@storybook/react"
import React from "react"

import { ThirdPartyTemplate } from "../../templates/sdk-template"
import { IIAuthCode, IIAuthCodeProps } from "./index"

const meta: Meta = {
  title: "Pages/IIAuthCode",
  component: IIAuthCode,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<IIAuthCodeProps> = (args) => (
  <ThirdPartyTemplate>
    <IIAuthCode {...args} />
  </ThirdPartyTemplate>
)

export const Default = {
  render: Template,

  args: {
    secureCode: "123456",
    anchor: 20176,
  },
}
