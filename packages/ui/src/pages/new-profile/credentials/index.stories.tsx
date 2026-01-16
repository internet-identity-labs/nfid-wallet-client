import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileCredentialsPage from "."
import ProfileAddPhoneNumber from "./add-phone-number"
import ProfileAddPhoneSMS from "./add-phone-sms"

export default {
  title: "Screens/NewProfile/Credentials",
  component: ProfileCredentialsPage,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof ProfileCredentialsPage>

const Template: StoryFn<typeof ProfileCredentialsPage> = (args) => {
  return (
    <Router>
      <ProfileCredentialsPage {...args} />
    </Router>
  )
}

const AddPhoneNumberTemplate: StoryFn<typeof ProfileAddPhoneNumber> = (
  args,
) => {
  return (
    <Router>
      <ProfileAddPhoneNumber {...args} />
    </Router>
  )
}
const AddPhoneSMSTemplate: StoryFn<typeof ProfileAddPhoneSMS> = (args) => {
  return (
    <Router>
      <ProfileAddPhoneSMS {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,

  args: {
    email: "pavlo@identitylabs.ooo",
  },
}

export const AddPhoneNumberScreen = {
  render: AddPhoneNumberTemplate,

  args: {
    onSubmit: (values: any) => console.log({ values }),
  },
}

export const AddPhoneSMSScreen = {
  render: AddPhoneSMSTemplate,

  args: {
    onResendCode: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("resend")
          resolve(undefined)
        }, 2000)
      })
    },
    onSubmit: (token: any) => {
      console.log({ token })
      return Promise.resolve()
    },
    phone: "d2d5bdf84ca7b3130cecf91ad8772d4d",
    resendDelay: 5,
  },
}
