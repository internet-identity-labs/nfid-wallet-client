import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import logo from "frontend/assets/distrikt.svg"

import { Captcha } from "."

export default {
  title: "Screens/Captcha",
  component: Captcha,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Captcha>

const CaptchaTemplate: ComponentStory<typeof Captcha> = (args) => {
  return (
    <Router>
      <Captcha {...args} />
    </Router>
  )
}

export const CaptchaScreen = CaptchaTemplate.bind({})

CaptchaScreen.args = {
  successPath: "#",
  applicationName: "Distrikt",
  applicationLogo: logo,
}
