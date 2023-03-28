import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter as Router } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import NFTPreview from "."

export default {
  title: "Atoms/NFT Preview",
  component: NFTPreview,
  parameters: {
    layout: "center",
  },
} as ComponentMeta<typeof NFTPreview>

const Template: ComponentStory<typeof NFTPreview> = (args) => {
  return (
    <Router>
      <ToastContainer />
      <NFTPreview {...args} />
    </Router>
  )
}

export const AppScreen = Template.bind({})

AppScreen.args = {}
