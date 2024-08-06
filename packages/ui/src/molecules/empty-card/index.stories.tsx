import { Meta, StoryFn } from "@storybook/react"

import { EmptyCard, IEmptyCard } from "."
import { ReactComponent as Policies } from "../../atoms/icons/policies.svg"

const meta: Meta = {
  title: "Molecules/EmptyCard",
}

export default meta

const EmptyCardStory: StoryFn<IEmptyCard> = (args) => {
  return <EmptyCard icon={<Policies />} description={args.description} />
}

export const Overview = {
  render: EmptyCard,
}

EmptyCardStory.args = {
  description:
    "Manage the policies that are automatically added for every wallet in your vault.",
}
