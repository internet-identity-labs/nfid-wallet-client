import React, { HTMLAttributes } from "react"

import ArrowBackIcon from "../../assets/arrow-back.svg"
import { BlurredLoader } from "../../molecules/blurred-loader"
import { Button } from "../../molecules/button"
import { TextArea } from "../../molecules/input/text-area"

export interface AuthRecoveryIIProps {
  onBack: () => void
  onRecover: () => void
  fieldProps?: HTMLAttributes<HTMLTextAreaElement>
  responseError?: string
  isLoading?: boolean
  isDisabled?: boolean
}

export const IIAuthRecovery: React.FC<AuthRecoveryIIProps> = ({
  onBack,
  onRecover,
  fieldProps,
  responseError,
  isLoading = false,
  isDisabled,
}) => {
  return (
    <BlurredLoader isLoading={isLoading} className="!p-0 relative">
      <div className="flex space-x-2">
        <img
          className="cursor-pointer"
          src={ArrowBackIcon}
          alt="back"
          onClick={onBack}
        />
        <p className="font-bold">Connect with recovery phrase</p>
      </div>
      <p className="mt-4 text-sm">
        To connect your Internet Identity and continue, enter your Internet
        Identity recovery phrase
      </p>

      <TextArea
        className="mt-5"
        rows={8}
        placeholder="10000 cute good fence purity play despair worth year layer install drastic vote skirt noble sadness miss gadget kitten ladder traffic risk phone bamboo"
        {...fieldProps}
      />

      <p className="text-xs text-red-500">{responseError}</p>

      <Button
        disabled={isDisabled}
        type="primary"
        block
        className="mt-5 mb-1"
        onClick={onRecover}
      >
        Connect
      </Button>
    </BlurredLoader>
  )
}
