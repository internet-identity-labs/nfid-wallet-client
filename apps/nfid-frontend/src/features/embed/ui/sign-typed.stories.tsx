import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { SignTypedData } from "./sign-typed"

export default {
  title: "Embed/SignTypedData",
  component: SignTypedData,
  args: {
    applicationMeta: {
      name: "Review",
      url: "rarible.com",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Rarible_Logo.png/480px-Rarible_Logo.png",
    },
  },
} as ComponentMeta<typeof SignTypedData>

const Template: ComponentStory<typeof SignTypedData> = (args) => (
  <BrowserRouter>
    <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100">
      <TooltipProvider>
        <SignTypedData {...args} />
      </TooltipProvider>
    </ScreenResponsive>
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {
  creators: [
    {
      account: "Account1",
      value: "10000",
    },
  ],
  royalties: [
    {
      account: "Account1",
      value: "10000",
    },
  ],
  tokenId:
    "55530736884937264859937465553073688493726485993746555307368849372648599374",
  tokenURI:
    "/ipfs/kjhfyei8oudhnem4isyhfipfskjhfyei8oudhnem4isyhfipfs/kjhfyei8oudhn",
}
