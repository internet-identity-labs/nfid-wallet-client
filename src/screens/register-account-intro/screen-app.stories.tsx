import { ComponentStory, ComponentMeta } from "@storybook/react"

import { RegisterAccountIntro } from "./screen-app"

export default {
  title: "Screens/RegisterAccountIntro",
  component: RegisterAccountIntro,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof RegisterAccountIntro>

const Template: ComponentStory<typeof RegisterAccountIntro> = (args) => {
  return <RegisterAccountIntro {...args} />
}

export const AppScreen = Template.bind({})

AppScreen.args = {}
