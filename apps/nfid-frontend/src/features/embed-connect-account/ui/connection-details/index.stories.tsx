import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { ConnectionDetails } from "./"

export default {
  title: "Embed/ConnectionDetails",
  component: ConnectionDetails,
} as ComponentMeta<typeof ConnectionDetails>

const Template: ComponentStory<typeof ConnectionDetails> = (args) => (
  <BrowserRouter>
    <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100">
      <TooltipProvider>
        <ConnectionDetails {...args} />
      </TooltipProvider>
    </ScreenResponsive>
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {
  details: [
    { label: "Request origin", value: "http://localhost:3000" },
    {
      label: "RPC ID",
      value: "06575185-ffd4-4abe-8986-478223ebab92",
    },
    {
      label: "Method",
      value: "eth_sendTransaction",
    },
    {
      label: "jsonrpc",
      value: "2.0",
    },
  ],
}
