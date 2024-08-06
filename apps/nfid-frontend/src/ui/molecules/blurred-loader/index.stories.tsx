import { Meta } from "@storybook/react"

import { BlurredLoader } from "."

const meta: Meta = {
  title: "Molecules/BlurredLoader",
  argTypes: {
    onClick: {
      action: "clicked",
    },
  },
}

export default meta

const BlurredLoaderTemplate = () => {
  return (
    <BlurredLoader isLoading>
      <div>Some content</div>
    </BlurredLoader>
  )
}

export const Overview = {
  render: BlurredLoaderTemplate,
}
