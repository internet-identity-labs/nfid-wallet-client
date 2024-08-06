import { Meta, StoryFn } from "@storybook/react"

import logo from "../../assets/id.svg"
import { ThirdPartyTemplate } from "../../templates/sdk-template"
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

const InitialTemplate: StoryFn<AuthWithIIProps> = (args) => (
  <ThirdPartyTemplate>
    <IIAuthEntry {...args} />
  </ThirdPartyTemplate>
)

export const StateInitial = {
  render: InitialTemplate,

  args: {
    applicationName: "NFID",
    applicationLogo: logo,
  },
}
