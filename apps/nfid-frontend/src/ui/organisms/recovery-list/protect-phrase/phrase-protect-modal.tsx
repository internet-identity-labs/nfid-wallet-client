import clsx from "clsx"
import { ModalAdvanced } from "packages/ui/src/molecules/modal/advanced"
import React, { useState } from "react"

import { Button } from "@nfid-frontend/ui"
import { SENSITIVE_CONTENT_NO_SESSION_RECORDING } from "@nfid/config"

interface IRecoveryPhraseProtectModal
  extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void
  onProtect: (a: string) => Promise<void>
}

const RecoveryPhraseProtectModal: React.FC<IRecoveryPhraseProtectModal> = ({
  onClose,
  onProtect,
}) => {
  const [phrase, setPhrase] = useState("")

  const handleProtect = React.useCallback(async () => {
    await onProtect(phrase)
    onClose()
  }, [onClose, onProtect, phrase])

  return (
    <ModalAdvanced
      title="Protect recovery phrase"
      subTitle="Once protected, a recovery phrase can only be removed by inputting it again."
      onClose={onClose}
      buttonsClassNames="py-3"
    >
      <div id="protect-modal">
        <textarea
          name="recoveryPhrase"
          className={clsx(
            SENSITIVE_CONTENT_NO_SESSION_RECORDING,
            "border border-black rounded-t-md",
            "focus:outline-none resize-none focus:ring-0",
            "w-full -mb-2 leading-[26px]",
          )}
          rows={6}
          placeholder="10000 cute good fence purity play despair worth year layer install drastic vote skirt noble sadness miss gadget kitten ladder traffic risk phone bamboo"
          onChange={(e) => setPhrase(e.target.value)}
        />
        <Button
          block
          className="rounded-t-none"
          onClick={handleProtect}
          id="protect-submit"
        >
          Protect recovery phrase
        </Button>
      </div>
    </ModalAdvanced>
  )
}

export default RecoveryPhraseProtectModal
