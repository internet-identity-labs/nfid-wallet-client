import { ComponentStory, ComponentMeta } from "@storybook/react"
// import { within, userEvent } from "@storybook/testing-library"
import React from "react"
import { BrowserRouter as Router } from "react-router-dom"

import { ModalSuccess } from "./modal-success"

export default {
  title: "Screens/Modals/Success",
  component: ModalSuccess,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ModalSuccess>

const ModalSuccessTemplate: ComponentStory<typeof ModalSuccess> = (args) => {
  return (
    <Router>
      <ModalSuccess {...args} />
    </Router>
  )
}

export const Success = ModalSuccessTemplate.bind({})

Success.args = {}
