import { Meta, StoryFn } from "@storybook/react"
import SecurityIcon from "packages/ui/src/atoms/icons/nav-security.svg"
import VaultsIcon from "packages/ui/src/atoms/icons/nav-vaults.svg"
import { BrowserRouter as Router } from "react-router-dom"

import { AuthenticatedPopup, IAuthenticatedPopup } from "."

const meta: Meta = {
  title: "Organisms/Header/Header Popup",
  component: AuthenticatedPopup,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<IAuthenticatedPopup> = (args) => (
  <Router>
    <div className="relative h-[400px]">
      <AuthenticatedPopup {...args} />
    </div>
  </Router>
)

Default.args = {
  anchor: 12345,
  onSignOut: () => console.log("Disconnect button clicked"),
  links: [
    {
      icon: VaultsIcon,
      title: "Vaults",
      link: "https://example.com",
      id: "link1",
      separator: true,
    },
    {
      icon: SecurityIcon,
      title: "Security",
      link: "https://example.com",
      id: "link2",
    },
  ],
}
