import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"

import { ProfileNFTDetailsPage } from "."

export default {
  title: "Screens/NewProfile/ProfileNFTDetailsPage",
  component: ProfileNFTDetailsPage,
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof ProfileNFTDetailsPage>

const Template: StoryFn<typeof ProfileNFTDetailsPage> = (args) => {
  return (
    <Router>
      <ProfileNFTDetailsPage {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,

  args: {
    nft: {} as any,
  },
}
