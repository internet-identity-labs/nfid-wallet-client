import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import Dfinity from "frontend/assets/dfinity.svg"

import ProfileAssetsPage from "."

export default {
  title: "Screens/NewProfile/Assets",
  component: ProfileAssetsPage,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ProfileAssetsPage>

const Template: ComponentStory<typeof ProfileAssetsPage> = (args) => {
  return (
    <Router>
      <ProfileAssetsPage {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  onIconClick: () => {},
  tokens: Array(1).fill({
    icon: Dfinity,
    title: "Internet Computer",
    subTitle: "ICP",
    balance: "987.12345678 ICP",
    price: 691,
  }),
}
