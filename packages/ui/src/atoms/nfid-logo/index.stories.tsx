import type { ComponentStory, ComponentMeta } from "@storybook/react"

import { NFIDLogo } from "./index"

const Story: ComponentMeta<typeof NFIDLogo> = {
  component: NFIDLogo,
  title: "atoms/NFIDLogo",
}
export default Story

const Template: ComponentStory<typeof NFIDLogo> = () => <NFIDLogo />

export const Primary = Template.bind({})
Primary.args = {}
