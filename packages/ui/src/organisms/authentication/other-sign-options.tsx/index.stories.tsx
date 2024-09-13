import { Meta, StoryFn } from "@storybook/react"
import { useForm } from "react-hook-form"

import { withSignInDecorator } from "../../../decorators/sign-in"
import { AuthOtherSignOptions, AuthOtherSignOptionsProps } from "./index"

const meta: Meta = {
  title: "Auth/Other Signin options",
  component: AuthOtherSignOptions,
  decorators: [withSignInDecorator],
  argTypes: {},
  parameters: {
    controls: { expanded: true },
    layout: "fullscreen",
  },
}

export default meta

export const Default: StoryFn<AuthOtherSignOptionsProps> = (args) => {
  const formMethods = useForm<{ userNumber: number }>({
    defaultValues: {
      userNumber: 12345,
    },
  })
  return (
    <AuthOtherSignOptions
      {...args}
      handleAuth={() => console.log("Continue button clicked")}
    />
  )
}

Default.args = {
  appMeta: "https://example.com",
  loadProfileFromLocalStorage: () => undefined,
  onBack: () => console.log("Back button clicked"),
}
