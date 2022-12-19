import { Meta, Story } from "@storybook/react"

import { EmptyTableCard, IEmptyTableCard } from "."
import { ReactComponent as Policies } from "../../atoms/icons/policies.svg"

const meta: Meta = {
  title: "Molecules/EmptyTableCard",
}

export default meta

const EmptyCard: Story<IEmptyTableCard> = (args) => {
  return <EmptyTableCard icon={<Policies />} description={args.description} />
}

export const Overview = EmptyCard.bind({})

Overview.args = {
  description:
    "Manage the policies that are automatically added for every wallet in your vault.",
}
