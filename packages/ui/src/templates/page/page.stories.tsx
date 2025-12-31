import type { StoryFn, Meta } from "@storybook/react"
import { withRouter } from "storybook-addon-remix-react-router"

import { Page } from "./page"

const Story: Meta<typeof Page> = {
  component: Page,
  title: "Templates/Page",
  decorators: [withRouter],
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
