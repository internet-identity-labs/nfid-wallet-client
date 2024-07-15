import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { PersonalSign } from "./personal-sign"

export default {
  title: "Embed/PersonalSign",
  component: PersonalSign,
  args: {
    applicationMeta: {
      name: "Review",
      url: "rarible.com",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Rarible_Logo.png/480px-Rarible_Logo.png",
    },
  },
} as ComponentMeta<typeof PersonalSign>

const Template: ComponentStory<typeof PersonalSign> = (args) => (
  <BrowserRouter>
    <TooltipProvider>
      <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-10">
        <PersonalSign {...args} />
      </ScreenResponsive>
    </TooltipProvider>
  </BrowserRouter>
)

export const Default = Template.bind({})

Default.args = {
  message:
    "I want to login on Rarible at 2023-02-09T10:12:58.918Z. I accept the Rarible Terms of Service http://static.rarible.com/terms.pdf and I am at least 13 years old.",
}
