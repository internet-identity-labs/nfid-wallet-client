import { Meta, StoryFn } from "@storybook/react"

import { ImageWithFallback, IImageWithFallbackProps } from "./index"

const meta: Meta = {
  title: "Atoms/Image with Fallback",
  component: ImageWithFallback,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<IImageWithFallbackProps> = (args) => {
  return <ImageWithFallback className="mx-auto py-[30px]" {...args} />
}

Default.args = {
  src: "Non-existing src",
  fallbackSrc: "https://placehold.co/600x400",
  alt: "Placeholder Image",
}
