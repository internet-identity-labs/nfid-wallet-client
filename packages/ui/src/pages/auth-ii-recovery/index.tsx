import React from "react"

import ArrowBackIcon from "../../assets/arrow-back.svg"
import { Button } from "../../atoms/button"
import { TextArea } from "../../atoms/input/text-area"

export interface AuthRecoveryIIProps {
  onBack: () => void
  onRecover: () => void
}

export const IIAuthRecovery: React.FC<AuthRecoveryIIProps> = ({
  onBack,
  onRecover,
}) => {
  return (
    <div>
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
        className="my-5"
        rows={8}
        placeholder="10000 cute good fence purity play despair worth year layer install drastic vote skirt noble sadness miss gadget kitten ladder traffic risk phone bamboo "
      />

      <Button primary block className="mb-1" onClick={onRecover}>
        Connect
      </Button>
    </div>
  )
}
