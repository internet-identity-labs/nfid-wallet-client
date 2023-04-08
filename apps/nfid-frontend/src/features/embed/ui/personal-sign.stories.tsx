import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { PersonalSign } from "./personal-sign"

export default {
  title: "PersonalSign",
  component: PersonalSign,
} as ComponentMeta<typeof PersonalSign>

const Template: ComponentStory<typeof PersonalSign> = (args) => (
  <BrowserRouter>
    <TooltipProvider>
      <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100 flex flex-col">
        <PersonalSign {...args} />
      </ScreenResponsive>
    </TooltipProvider>
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {
  applicationMeta: {
    name: "Review",
    url: "rarible.com",
  },
  message:
    "I want to login on Rarible at 2023-02-09T10:12:58.918Z. I accept the Rarible Terms of Service http://static.rarible.com/terms.pdf and I am at least 13 years old.",
}
