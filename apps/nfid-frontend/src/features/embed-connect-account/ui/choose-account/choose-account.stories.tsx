import { TooltipProvider } from "@radix-ui/react-tooltip"
import type { ComponentStory, Meta } from "@storybook/react"
import { withRouter } from "storybook-addon-react-router-v6"

import { ScreenResponsive } from "@nfid-frontend/ui"

import { ChooseAccount } from "./choose-account"

const Story: Meta<typeof ChooseAccount> = {
  component: ChooseAccount,
  title: "Embed/ChooseAccount",
  decorators: [withRouter],
}
export default Story

const Template: ComponentStory<typeof ChooseAccount> = (args) => (
  <TooltipProvider>
    <ScreenResponsive className="overflow-auto max-w-[450px] max-h-[580px] shadow-lg m-auto border border-gray-100 relative">
      <ChooseAccount {...args} />
    </ScreenResponsive>
  </TooltipProvider>
)

export const Default = Template.bind({})

Default.args = {
  appMeta: {
    name: "Rarible",
    logo: "https://app.rarible.com/favicon.ico",
    url: "rarible.com",
  },
  accounts: [
    {
      label: "Public",
      options: [
        {
          title: "NFID Account 1",
          value: "mpdxa-aaaaa-aaaaa-aaaba-cai",
          subTitle: "mpdxa-aaaaa-aaaaa-aaaba-cai",
        },
      ],
    },
  ],
  onConnectAnonymously: () => {},
}
