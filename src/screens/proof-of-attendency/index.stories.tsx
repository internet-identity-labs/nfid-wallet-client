import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { ProofOfAttendency } from "."

export default {
  title: "Screens/ProofOfAttendency",
  component: ProofOfAttendency,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ProofOfAttendency>

const Template: ComponentStory<typeof ProofOfAttendency> = (args) => {
  return (
    <Router>
      <ProofOfAttendency {...args} />
    </Router>
  )
}

export const Default = Template.bind({})

Default.args = {
  continueButtonContent: "Continue with POA",
  isLoading: false,
}

// More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
// Default.play = async ({ canvasElement }) => {
//   const canvas = within(canvasElement)
//   const loginButton = await canvas.getByRole("button", { name: /Log in/i })
//   await userEvent.click(loginButton)
// }
