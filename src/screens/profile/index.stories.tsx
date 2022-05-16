import { ModalAdvancedProps } from "@internet-identity-labs/nfid-sdk-react"
import { ComponentStory, ComponentMeta } from "@storybook/react"
// import { within, userEvent } from "@storybook/testing-library"
import React from "react"
import { BrowserRouter as Router } from "react-router-dom"

import { Profile } from "."

export default {
  title: "Screens/Profile",
  component: Profile,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof Profile>

const Template: ComponentStory<typeof Profile> = (args) => {
  const [showModal, setShowModal] = React.useState(args.showModal)
  const [modalOptions, setModalOptions] =
    React.useState<ModalAdvancedProps | null>(args.modalOptions)

  return (
    <Router>
      <Profile
        {...args}
        showModal={showModal}
        modalOptions={modalOptions}
        setModalOptions={setModalOptions}
        setShowModal={setShowModal}
      />
    </Router>
  )
}

export const LoggedIn = Template.bind({})

LoggedIn.args = {
  account: { anchor: "10005", name: "Test Account" },
  personas: [
    { domain: "wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app", persona_id: "1" },
    { domain: "https://wzkxy-vyaaa-aaaaj-qab3q-cai.ic0.app", persona_id: "2" },
  ],
  devices: [{ alias: "My Device", pubkey: [123, 456, 789] }, { alias: "Recovery Phrase", pubkey: [0, 0, 0], recovery: true }],
  loading: false,
  showModal: false,
}

// More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
// LoggedIn.play = async ({ canvasElement }) => {
//   const canvas = within(canvasElement)
//   const loginButton = await canvas.getByRole("button", { name: /Log in/i })
//   await userEvent.click(loginButton)
// }
