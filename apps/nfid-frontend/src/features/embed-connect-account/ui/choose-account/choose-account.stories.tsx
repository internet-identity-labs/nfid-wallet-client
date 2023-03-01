import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ComponentMeta, ComponentStory } from "@storybook/react"
import { BrowserRouter } from "react-router-dom"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { ChooseAccount } from "."
import Logo from "../../assets/ic.svg"

export default {
  title: "Organisms/ChooseAccount",
  component: ChooseAccount,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ChooseAccount>

const Template: ComponentStory<typeof ChooseAccount> = (args) => {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <ScreenResponsive>
          <ChooseAccount {...args} />
        </ScreenResponsive>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export const ChooseAccountScreen = Template.bind({})

ChooseAccountScreen.args = {
  applicationName: "Rarible",
  applicationURL: "rarible.com",
  applicationLogo: Logo,
  onConnectionDetails: () => [],
}
