import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import Pagination from "."

export default {
  title: "Molecules/Pagination",
  component: Pagination,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Pagination>

const Template: ComponentStory<typeof Pagination> = (args) => {
  return (
    <Router>
      <Pagination {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {}
