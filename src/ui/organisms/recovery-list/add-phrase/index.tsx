import clsx from "clsx"
import React from "react"

import { Button } from "frontend/ui/atoms/button"
import { CopyIcon } from "frontend/ui/atoms/icons/copy"
import { ModalAdvanced } from "frontend/ui/molecules/modal/advanced"

interface IAddRecoveryPhraseModal extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void
  onCopy: () => void
}

const AddRecoveryPhraseModal: React.FC<IAddRecoveryPhraseModal> = ({
  onClose,
  onCopy,
}) => {
  return (
    <ModalAdvanced
      title="Add recovery phrase"
      subTitle={
        <>
          This recovery phrase restores your NFID in case the devices you
          registered are lost. Keep this phrase secret, safe, offline, and only
          use it on <b>https://nfid.one.</b>
        </>
      }
      onClose={onClose}
      onBgClick={onClose}
      buttonsClassNames="py-3"
    >
      <div>
        <div
          className={clsx(
            "border border-black-base rounded-t-md",
            "focus:outline-none resize-none focus:ring-0",
            "w-full font-mono leading-[26px] p-2",
          )}
        >
          worry cute good fence purity play despair worth year layer install
          drastic vote skirt noble sadness miss gadget kitten ladder traffic
          risk phone bamboo{" "}
        </div>
        <Button
          block
          className="flex justify-center space-x-2 rounded-t-none"
          onClick={onCopy}
        >
          <CopyIcon className="text-black-base" />
          <span>Copy</span>
        </Button>
      </div>
    </ModalAdvanced>
  )
}

export default AddRecoveryPhraseModal
