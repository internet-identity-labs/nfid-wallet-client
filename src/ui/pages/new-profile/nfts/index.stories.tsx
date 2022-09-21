import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import ProfileNFTsPage from "."
import mockPrincipalTokens from "./__mock"

export default {
  title: "Screens/NewProfile/NFTs",
  component: ProfileNFTsPage,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ProfileNFTsPage>

const Template: ComponentStory<typeof ProfileNFTsPage> = (args) => {
  return (
    <Router>
      <ToastContainer />
      <ProfileNFTsPage {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {
  tokens: mockPrincipalTokens,
}
