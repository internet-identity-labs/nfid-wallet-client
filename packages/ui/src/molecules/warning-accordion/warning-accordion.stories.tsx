import type { ComponentStory, ComponentMeta } from "@storybook/react"

import { WarningAccordion } from "."

const Story: ComponentMeta<typeof WarningAccordion> = {
  component: WarningAccordion,
  title: "Molecules/WarningAccordion",
}
export default Story

const Template: ComponentStory<typeof WarningAccordion> = (args) => (
  <WarningAccordion
    warnings={[
      {
        title: "Transaction preview unavailable",
        subtitle:
          "Unable to estimate asset changes. Please make sure you trust this dapp.",
      },
      {
        title: "Transaction preview unavailable",
        subtitle: "2",
      },
      {
        title: "Transaction preview unavailable",
        subtitle: "3",
      },
    ]}
  />
)

export const Default = Template.bind({})
