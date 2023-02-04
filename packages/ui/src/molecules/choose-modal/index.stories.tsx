import { ComponentStory, ComponentMeta } from "@storybook/react"

import InternetComputerIcon from "../../assets/ic.svg"
import { ChoseModal } from "./index"

export default {
  title: "Molecules/ChoseModal",
  component: ChoseModal,
} as ComponentMeta<typeof ChoseModal>

const ChoseModalWrapper: ComponentStory<typeof ChoseModal> = (args) => {
  return <ChoseModal {...args} />
}

export const ChoseModalScreen = ChoseModalWrapper.bind({})

ChoseModalScreen.args = {
  title: "Choose an asset",
  optionGroups: [
    {
      label: "label 1",
      options: [
        {
          title: "title",
          subTitle: "subtitle",
          icon: InternetComputerIcon,
          innerTitle: "innerTitle",
          innerSubtitle: "innerSubtitle",
          value: "300",
        },
        {
          title: "assss",
          subTitle: "subtitle",
          innerTitle: "innerTitle",
          innerSubtitle: "innerSubtitle",
          value: "500",
        },
      ],
    },
    {
      label: "label 2",
      options: [
        {
          title: "something",
          subTitle: "subtitle",
          innerTitle: "innerTitle",
          innerSubtitle: "innerSubtitle",
          value: "300",
        },
        {
          title: "assss",
          icon: InternetComputerIcon,
          subTitle: "subtitle",
          value: "500",
        },
      ],
    },
    {
      label: "label 3",
      options: [
        {
          title: "else",
          subTitle: "subtitle",
          innerTitle: "innerTitle",
          innerSubtitle: "innerSubtitle",
          value: "300",
        },
        {
          title: "assss",
          icon: InternetComputerIcon,
          subTitle: "subtitle",
          value: "500",
        },
      ],
    },
    {
      label: "label 4",
      options: [
        {
          title: "bla",
          subTitle: "subtitle",
          innerTitle: "innerTitle",
          innerSubtitle: "innerSubtitle",
          value: "300",
        },
        {
          title: "pavlo",
          icon: InternetComputerIcon,
          subTitle: "subtitle",
          value: "500",
        },
      ],
    },
  ],
}
