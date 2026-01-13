import { Meta, StoryFn } from "@storybook/react"

import { Challenge } from "."
import { base_png } from "./mocks"

const meta: Meta = {
  title: "Molecules/Challenge",
  component: Challenge,
}

export default meta

const ChallengeTemplate: StoryFn = ({ isLoading, src, ...args }) => {
  return <Challenge src={!isLoading && src} {...args} />
}

export const ListComponent = {
  render: ChallengeTemplate,

  args: {
    src: `data:image/png;base64,${base_png}`,
    isLoading: false,
  },
}
