import type { Meta, StoryFn } from "@storybook/react"

import { WarningAccordion } from "."

const Story: Meta<typeof WarningAccordion> = {
  component: WarningAccordion,
  title: "Molecules/WarningAccordion",
}
export default Story

const Template: StoryFn<typeof WarningAccordion> = (_args) => (
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

export const Default = {
  render: Template,
}
