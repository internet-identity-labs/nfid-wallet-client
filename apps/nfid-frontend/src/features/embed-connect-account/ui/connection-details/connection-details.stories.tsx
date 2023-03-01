import { ComponentMeta, ComponentStory } from "@storybook/react"

import { ConnectionDetails } from "."

export default {
  title: "Organisms/ConnectionDetails",
  component: ConnectionDetails,
  parameters: {
    layout: "fullscreen",
  },
} as ComponentMeta<typeof ConnectionDetails>

const Template: ComponentStory<typeof ConnectionDetails> = () => {
  return (
    <ConnectionDetails
      onBack={function (): void {
        throw new Error("Function not implemented.")
      }}
    />
  )
}

export const ConnectionDetailsScreen = Template.bind({})
