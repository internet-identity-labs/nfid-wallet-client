import clsx from "clsx"
import React from "react"

import { Button } from "frontend/ui/atoms/button"
import { ModalAdvanced } from "frontend/ui/molecules/modal/advanced"

interface IRecoveryPhraseDeleteModal
  extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void
  onDelete: (a: any) => void
}

const RecoveryPhraseDeleteModal: React.FC<IRecoveryPhraseDeleteModal> = ({
  onClose,
  onDelete,
}) => {
  return (
    <ModalAdvanced
      title="Remove recovery phrase"
      subTitle="Enter your recovery phrase to confirm removal."
      onClose={onClose}
      onBgClick={onClose}
      buttonsClassNames="py-3"
    >
      <div>
        <textarea
          name="recoveryPhrase"
          className={clsx(
            "border border-black-base rounded-t-md",
            "focus:outline-none resize-none focus:ring-0",
            "w-full -mb-2 font-mono leading-[26px]",
          )}
          rows={5}
          placeholder="lorem ipsum dolor ..."
        />
        <Button error block className="rounded-t-none" onClick={onDelete}>
          Remove recovery phrase
        </Button>
      </div>
    </ModalAdvanced>
  )
}

export default RecoveryPhraseDeleteModal
