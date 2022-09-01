import clsx from "clsx"
import React, { useState } from "react"

import { Button } from "frontend/ui/atoms/button"
import { ModalAdvanced } from "frontend/ui/molecules/modal/advanced"

interface IRecoveryPhraseProtectModal
  extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void
  onProtect: (a: string) => void
}

const RecoveryPhraseProtectModal: React.FC<IRecoveryPhraseProtectModal> = ({
  onClose,
  onProtect,
}) => {
  const [phrase, setPhrase] = useState("")

  return (
    <ModalAdvanced
      title="Protect recovery phrase"
      subTitle="Once protected, a recovery phrase can only be removed by inputting it again."
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
          onChange={(e) => setPhrase(e.target.value)}
        />
        <Button
          primary
          block
          className="rounded-t-none"
          onClick={() => onProtect(phrase)}
        >
          Protect recovery phrase
        </Button>
      </div>
    </ModalAdvanced>
  )
}

export default RecoveryPhraseProtectModal
