import { Decorator } from "@storybook/react"

export const withSignInDecorator: Decorator = (Story) => {
  return (
    <div className="relative m-auto z-10 flex flex-col justify-between w-[95vw] md:w-[450px] h-[600px] p-5">
      <Story />
    </div>
  )
}
