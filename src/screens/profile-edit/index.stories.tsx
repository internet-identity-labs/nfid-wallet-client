import { ComponentStory, ComponentMeta } from "@storybook/react"
// import { within, userEvent } from "@storybook/testing-library"
import React from "react"
import { BrowserRouter as Router } from "react-router-dom"

import { ProfileEdit } from "."
import { ProfileEditPhone } from "./phone"
import { ProfileEditPhoneSms } from "./phone-sms"

export default {
  title: "Screens/ProfileEdit",
  component: ProfileEdit,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  args: {
    account: { anchor: "10005", name: "Test Account", phone: "" },
  },
} as ComponentMeta<typeof ProfileEdit>

const Template: ComponentStory<typeof ProfileEdit> = (args) => {
  return (
    <Router>
      <ProfileEdit {...args} />
    </Router>
  )
}

const TemplateEditPhone: ComponentStory<typeof ProfileEditPhone> = (args) => {
  return (
    <Router>
      <ProfileEditPhone {...args} />
    </Router>
  )
}

const TemplateSMS: ComponentStory<typeof ProfileEditPhoneSms> = (args) => {
  return (
    <Router>
      <ProfileEditPhoneSms {...args} />
    </Router>
  )
}

export const Edit = Template.bind({})
export const EditPhone = TemplateEditPhone.bind({})
export const EditPhoneSms = TemplateSMS.bind({})

// More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
// LoggedIn.play = async ({ canvasElement }) => {
//   const canvas = within(canvasElement)
//   const loginButton = await canvas.getByRole("button", { name: /Log in/i })
//   await userEvent.click(loginButton)
// }
