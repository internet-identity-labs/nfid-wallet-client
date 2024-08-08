import { StoryFn, Meta } from "@storybook/react"

import InternetComputerIcon from "../../assets/ic.svg"
import { ChooseModal } from "./index"

export default {
  title: "Molecules/ChoseModal",
  component: ChooseModal,
} as Meta<typeof ChooseModal>

const ChoseModalWrapper: StoryFn<typeof ChooseModal> = (args) => {
  return (
    <div className="space-y-4">
      <ChooseModal {...args} type="trigger" trigger={<div>trigger</div>} />
      <ChooseModal {...args} type="input" isFirstPreselected={false} />
      <ChooseModal {...args} />
    </div>
  )
}

export const ChooseModalScreen = {
  render: ChoseModalWrapper,

  args: {
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
  },
}
