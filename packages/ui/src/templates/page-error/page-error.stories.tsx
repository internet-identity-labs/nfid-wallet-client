import type { ComponentStory, Meta } from "@storybook/react"
import { withRouter } from "storybook-addon-react-router-v6"

import { PageError as Page, PageError } from "./page-error"

const Story: Meta<typeof Page> = {
  component: Page,
  title: "Templates/PageError",
  decorators: [withRouter],
}
export default Story

const Template: ComponentStory<typeof Page> = (args) => (
  <PageError
    error={
      new Error(
        "something terrible happended with an incredible looooooooooooooooooooooooooooooong messaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaage",
      )
    }
    {...args}
  />
)

export const Default = Template.bind({})

Default.args = {}
