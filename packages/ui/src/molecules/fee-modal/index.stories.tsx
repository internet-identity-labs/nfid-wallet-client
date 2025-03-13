import { Meta, StoryFn } from "@storybook/react"
import clsx from "clsx"
import React from "react"

import { FeeModal, IFeeModal } from "./index"

const meta: Meta = {
  title: "Molecules/FeeModal",
  component: FeeModal,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

const Template: StoryFn<IFeeModal> = (args) => (
  <div
    className={clsx([
      "transition ease-in-out delay-150 duration-300",
      "z-40 top-0 left-0 w-full h-screen",
      "fixed bg-opacity-80 bg-[#18181B]",
    ])}
    style={{ margin: 0 }}
  >
    <div
      className={clsx(
        "rounded-xl shadow-lg p-5 text-black overflow-hidden",
        "z-20 bg-white absolute flex flex-col",
        "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
        "w-[95%] sm:w-[450px] h-[580px]",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <FeeModal {...args} />
    </div>
  </div>
)

export const Default = {
  render: Template,

  args: {
    feeOptions: [
      {
        title: "Slow",
        subTitle: "45+ sec",
        innerTitle: "$10.14",
        innerSubtitle: "0.0103 ETH",
        onClick: () => alert("slow selected"),
      },
      {
        title: "Normal",
        subTitle: "~30 sec",
        innerTitle: "$16.67",
        innerSubtitle: "0.0103 ETH",
        onClick: () => alert("normal selected"),
      },
      {
        title: "Fast",
        subTitle: "~15 sec",
        innerTitle: "$19.66",
        innerSubtitle: "0.0103 ETH",
        onClick: () => alert("fast selected"),
      },
      {
        title: "Site suggested",
        subTitle: "~15 sec",
        innerTitle: "$24.66",
        innerSubtitle: "0.0103 ETH",
        onClick: () => alert("suggested selected"),
      },
      {
        title: "Custom",
        subTitle: "~10 sec",
        innerTitle: "$25",
        innerSubtitle: "0.0119139 ETH",
        onClick: () => alert("suggested selected"),
        onConfig: () => alert("a"),
      },
    ],
  },
}
