import clsx from "clsx"
import { ButtonAlt } from "packages/ui/src/atoms/button"
import { ModalAdvanced } from "packages/ui/src/molecules/modal/advanced"
import React from "react"

import { SENSITIVE_CONTENT_NO_SESSION_RECORDING } from "@nfid/config"

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
      buttonsClassNames="py-3"
    >
      <div>
        <textarea
          name="recoveryPhrase"
          className={clsx(
            SENSITIVE_CONTENT_NO_SESSION_RECORDING,
            "border border-black rounded-t-md",
            "focus:outline-none resize-none focus:ring-0",
            "w-full -mb-2 leading-[26px]",
          )}
          rows={5}
          placeholder="lorem ipsum dolor ..."
        />
        <ButtonAlt error block className="rounded-t-none" onClick={onDelete}>
          Remove recovery phrase
        </ButtonAlt>
      </div>
    </ModalAdvanced>
  )
}

export default RecoveryPhraseDeleteModal
