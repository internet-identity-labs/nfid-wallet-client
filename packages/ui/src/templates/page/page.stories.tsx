import type { StoryFn, Meta } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"

import { Page } from "./page"

const Story: Meta<typeof Page> = {
  component: Page,
  title: "Templates/Page",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
}
export default Story

const Template: StoryFn<typeof Page> = (_args) => (
  <Page>
    <Page.Header>Header One</Page.Header>
    <Page.Body>Body</Page.Body>
    <Page.Footer>Footer</Page.Footer>
  </Page>
)

export const Default = {
  render: Template,
  args: {},
}
