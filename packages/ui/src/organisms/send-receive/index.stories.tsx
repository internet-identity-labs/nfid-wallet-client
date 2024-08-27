import { Meta, StoryFn } from "@storybook/react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { SendReceiveModal, SendReceiveModalProps } from "."
import { Receive } from "./components/receive"
import { ReceiveUiProps } from "./components/receive.stories"
import { TransferFTUi } from "./components/send-ft"
import { SendFTProps } from "./components/send-ft.stories"
import { TransferNFTUi } from "./components/send-nft"
import { SendNFTProps } from "./components/send-nft.stories"

type FormFields = {
  amount: string
  to: string
}

export default {
  title: "Organisms/Send Receive",
  component: SendReceiveModal,
  argTypes: {
    onClickOutside: { action: "clicked outside" },
    onTokenTypeChange: { action: "token type changed" },
    onModalTypeChange: { action: "modal type changed" },
  },
} as Meta

const selectComponent = (tokenType: string, direction: string) => {
  const { register, setValue, handleSubmit, resetField, formState } =
    useForm<FormFields>({
      defaultValues: {
        amount: "",
        to: "",
      },
    })
  if (direction === "receive") {
    return <Receive {...ReceiveUiProps} />
  } else {
    if (tokenType === "ft") {
      return (
        <TransferFTUi
          register={register}
          setValue={setValue}
          handleSubmit={handleSubmit}
          resetField={resetField}
          errors={formState.errors}
          {...SendFTProps}
        />
      )
    } else {
      return <TransferNFTUi {...SendNFTProps} />
    }
  }
}

const Template: StoryFn<SendReceiveModalProps> = (args) => {
  const [tokenType, setTokenType] = useState(args.tokenType)
  const [direction, setDirection] = useState(args.direction)
  const handleTokenTypeChange = (isNFT: boolean) => {
    const newTokenType = isNFT ? "nft" : "ft"
    setTokenType(newTokenType)
    args.onTokenTypeChange(isNFT)
  }

  const handleModalTypeChange = (direction: string) => {
    setDirection(direction as "send" | "receive")
    args.onModalTypeChange(direction)
  }

  return (
    <SendReceiveModal
      {...args}
      component={selectComponent(tokenType, direction)}
      onTokenTypeChange={handleTokenTypeChange}
      onModalTypeChange={handleModalTypeChange}
      direction={direction}
    />
  )
}

export const Combined = Template.bind({})

Combined.args = {
  isSuccess: false,
  direction: "send",
  tokenType: "ft",
  onClickOutside: () => {},
  onTokenTypeChange: (isNFT) => console.log(isNFT),
  onModalTypeChange: (value) => console.log(value),
}
