import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { ProfileNFTDetailsPage } from "."

export default {
  title: "Screens/NewProfile/ProfileNFTDetailsPage",
  component: ProfileNFTDetailsPage,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ProfileNFTDetailsPage>

const Template: ComponentStory<typeof ProfileNFTDetailsPage> = (args) => {
  return (
    <Router>
      <ProfileNFTDetailsPage {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  nft: {} as any,
}
