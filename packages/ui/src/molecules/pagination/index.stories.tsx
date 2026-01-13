import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import Pagination from "."

export default {
  title: "Molecules/Pagination",
  component: Pagination,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof Pagination>

const Template: StoryFn<typeof Pagination> = (args) => {
  return (
    <Router>
      <Pagination {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,
  args: {},
}
