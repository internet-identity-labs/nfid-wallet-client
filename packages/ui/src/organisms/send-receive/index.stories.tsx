import { Meta, StoryFn } from "@storybook/react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { ModalType } from "frontend/features/transfer-modal/types"

import { TransferModal, TransferModalProps } from "."
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
  component: TransferModal,
  argTypes: {
    onClickOutside: { action: "clicked outside" },
    onTokenTypeChange: { action: "token type changed" },
    onModalTypeChange: { action: "modal type changed" },
  },
} as Meta

const SelectComponent = ({ tokenType }: { tokenType: string }) => {
  const { register, setValue, handleSubmit, resetField, formState } =
    useForm<FormFields>({
      defaultValues: {
        amount: "",
        to: "",
      },
    })
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

const Template: StoryFn<TransferModalProps> = (args) => {
  const [tokenType, setTokenType] = useState(args.tokenType)
  const handleTokenTypeChange = (isNFT: boolean) => {
    const newTokenType = isNFT ? "nft" : "ft"
    setTokenType(newTokenType)
    args.onTokenTypeChange(isNFT)
  }

  return (
    <TransferModal
      {...args}
      component={<SelectComponent tokenType={tokenType} />}
      onTokenTypeChange={handleTokenTypeChange}
    />
  )
}

export const Combined = Template.bind({})

Combined.args = {
  isSuccess: false,
  direction: ModalType.SEND,
  tokenType: "ft",
  onClickOutside: () => {},
  onTokenTypeChange: (isNFT) => console.log(isNFT),
}
