import { TooltipProvider } from "@radix-ui/react-tooltip"
import { StoryFn, Meta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { Loader } from "./loader"

export default {
  title: "Embed/Loader",
  component: Loader,
} as Meta<typeof Loader>

const Template: StoryFn<typeof Loader> = (_args) => (
  <BrowserRouter>
    <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100">
      <TooltipProvider>
        <Loader />
      </TooltipProvider>
    </ScreenResponsive>
  </BrowserRouter>
)

export const Default = {
  render: Template,
  args: {},
}
