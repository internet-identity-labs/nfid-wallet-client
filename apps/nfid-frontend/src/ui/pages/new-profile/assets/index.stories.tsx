import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import Dfinity from "frontend/assets/dfinity.svg"

import ProfileAssetsPage from "."

export default {
  title: "Screens/NewProfile/Assets",
  component: ProfileAssetsPage,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof ProfileAssetsPage>

const Template: StoryFn<typeof ProfileAssetsPage> = (args) => {
  return (
    <Router>
      <ProfileAssetsPage {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,

  args: {
    onIconClick: () => {},
    tokens: Array(1).fill({
      icon: Dfinity,
      title: "Internet Computer",
      subTitle: "ICP",
      balance: "987.12345678 ICP",
      price: 691,
    }),
  },
}
