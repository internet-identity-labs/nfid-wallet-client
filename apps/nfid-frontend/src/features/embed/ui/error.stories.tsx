import type { StoryFn, Meta } from "@storybook/react"
import { withRouter } from "storybook-addon-remix-react-router"

import { ScreenResponsive } from "@nfid/ui"

import { PageError } from "./error"

const Story: Meta<typeof PageError> = {
  component: PageError,
  title: "Embed/Error",
  decorators: [withRouter],
}
export default Story

const Template: StoryFn<typeof PageError> = (args) => (
  <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100">
    <PageError {...args} />
  </ScreenResponsive>
)

export const Default = {
  render: Template,

  args: {
    // @ts-ignore
    PageError: new Error("dasdasdasd"),
  },
}
