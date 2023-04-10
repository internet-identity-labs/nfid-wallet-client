import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { Details } from "./details"

export default {
  title: "Embed/Details",
  component: Details,
} as ComponentMeta<typeof Details>

const Template: ComponentStory<typeof Details> = (args) => (
  <BrowserRouter>
    <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100">
      <TooltipProvider>
        <Details
          onClose={function (): void {
            throw new Error("Function not implemented.")
          }}
        />
      </TooltipProvider>
    </ScreenResponsive>
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {}
