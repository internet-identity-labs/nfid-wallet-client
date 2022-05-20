import { Meta, Story } from "@storybook/react"

import { Challenge } from "."
import { base_png } from "./mocks"

const meta: Meta = {
  title: "Molecules/Challenge",
  component: Challenge,
}

export default meta

const ChallengeTemplate: Story = ({ isLoading, src, ...args }) => {
  return <Challenge src={!isLoading && src} {...args} />
}

export const ListComponent = ChallengeTemplate.bind({})

ListComponent.args = {
  src: `data:image/png;base64,${base_png}`,
  isLoading: false,
}
