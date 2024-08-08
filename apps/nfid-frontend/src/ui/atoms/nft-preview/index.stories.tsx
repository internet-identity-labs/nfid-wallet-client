import { StoryFn, Meta } from "@storybook/react"
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
} as Meta<typeof NFTPreview>

const Template: StoryFn<typeof NFTPreview> = (args) => {
  return (
    <Router>
      <ToastContainer />
      <NFTPreview {...args} />
    </Router>
  )
}

export const AppScreen = {
  render: Template,
  args: {},
}
