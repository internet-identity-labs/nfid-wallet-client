import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import ProfileNewTransaction from "."

export default {
  title: "Organisms/NewProfile/NewTransaction",
  component: ProfileNewTransaction,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ProfileNewTransaction>

const Template: ComponentStory<typeof ProfileNewTransaction> = (args) => {
  return (
    <Router>
      <ProfileNewTransaction {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  errorString: "",
  account: "10hdi02jqd0912edjc98h9281ejd09fj09j09ejc09jx019j0jd",
  isSuccess: true,
}
