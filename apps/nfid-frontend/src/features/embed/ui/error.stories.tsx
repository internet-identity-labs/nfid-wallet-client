import type { StoryFn, Meta } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { PageError } from "./error"

const Story: Meta<typeof PageError> = {
  component: PageError,
  title: "Embed/Error",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
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
