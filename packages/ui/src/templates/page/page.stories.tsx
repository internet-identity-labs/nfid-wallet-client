import type { ComponentStory, Meta } from "@storybook/react"
import { withRouter } from "storybook-addon-react-router-v6"

import { Page } from "./page"

const Story: Meta<typeof Page> = {
  component: Page,
  title: "Templates/Page",
  decorators: [withRouter],
}
export default Story

const Template: ComponentStory<typeof Page> = (args) => (
  <Page>
    <Page.Header>Header One</Page.Header>
    <Page.Body>Body</Page.Body>
    <Page.Footer>Footer</Page.Footer>
  </Page>
)

export const Default = Template.bind({})

Default.args = {}
