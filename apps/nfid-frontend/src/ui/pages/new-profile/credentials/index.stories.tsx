import { ComponentStory, ComponentMeta } from "@storybook/react"
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
} as ComponentMeta<typeof ProfileCredentialsPage>

const Template: ComponentStory<typeof ProfileCredentialsPage> = (args) => {
  return (
    <Router>
      <ProfileCredentialsPage {...args} />
    </Router>
  )
}

const AddPhoneNumberTemplate: ComponentStory<typeof ProfileAddPhoneNumber> = (
  args,
) => {
  return (
    <Router>
      <ProfileAddPhoneNumber {...args} />
    </Router>
  )
}
const AddPhoneSMSTemplate: ComponentStory<typeof ProfileAddPhoneSMS> = (
  args,
) => {
  return (
    <Router>
      <ProfileAddPhoneSMS {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})
export const AddPhoneNumberScreen = AddPhoneNumberTemplate.bind({})
export const AddPhoneSMSScreen = AddPhoneSMSTemplate.bind({})

AppScreen.args = {
  email: "pavlo@identitylabs.ooo",
}

AddPhoneNumberScreen.args = {
  onSubmit: (values: any) => console.log({ values }),
}

AddPhoneSMSScreen.args = {
  onResendCode: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("resend")
        resolve(undefined)
      }, 2000)
    })
  },
  onSubmit: (token) => {
    console.log({ token })
    return Promise.resolve()
  },
  phone: "d2d5bdf84ca7b3130cecf91ad8772d4d",
  resendDelay: 5,
}
