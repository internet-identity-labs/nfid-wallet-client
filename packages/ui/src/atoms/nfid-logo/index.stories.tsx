import type { StoryFn, Meta } from "@storybook/react"

import { NFIDLogo } from "./index"

const Story: Meta<typeof NFIDLogo> = {
  component: NFIDLogo,
  title: "atoms/NFIDLogo",
}
export default Story

const Template: StoryFn<typeof NFIDLogo> = () => <NFIDLogo />

export const Primary = {
  render: Template,
  args: {},
}
