import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { RegisterDevice } from "."

export default {
  title: "Screens/RegisterDevice",
  component: RegisterDevice,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof RegisterDevice>

const Template: ComponentStory<typeof RegisterDevice> = (args) => {
  return (
    <Router>
      <RegisterDevice {...args} />
    </Router>
  )
}

export const Default = Template.bind({})

Default.args = {}

// More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
// Default.play = async ({ canvasElement }) => {
//   const canvas = within(canvasElement)
//   const loginButton = await canvas.getByRole("button", { name: /Log in/i })
//   await userEvent.click(loginButton)
// }
