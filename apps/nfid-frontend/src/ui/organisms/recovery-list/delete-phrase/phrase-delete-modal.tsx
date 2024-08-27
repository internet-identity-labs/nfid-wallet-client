import clsx from "clsx"
import React, { useState } from "react"
import { toast } from "react-toastify"

import { Loader } from "@nfid-frontend/ui"
import { SENSITIVE_CONTENT_NO_SESSION_RECORDING } from "@nfid/config"

import { Button } from "frontend/ui/atoms/button"
import { ModalAdvanced } from "frontend/ui/molecules/modal/advanced"

interface IRecoveryPhraseDeleteModal
  extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void
  onDelete: (a: string) => Promise<void>
}

const RecoveryPhraseDeleteModal: React.FC<IRecoveryPhraseDeleteModal> = ({
  onClose,
  onDelete,
}) => {
  const [phrase, setPhrase] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const handleDelete = React.useCallback(async () => {
    setIsLoading(true)
    try {
      await onDelete(phrase)
      onClose()
    } catch (e) {
      console.error(e)
      toast.error("Incorrect seed phrase")
    } finally {
      setIsLoading(false)
    }
  }, [onClose, onDelete, phrase])

  return (
    <ModalAdvanced
      title="Remove recovery phrase"
      subTitle="Enter your recovery phrase to confirm removal."
      onClose={onClose}
      buttonsClassNames="py-3"
    >
      <Loader isLoading={isLoading} />
      <div>
        <textarea
          name="recoveryPhrase"
          className={clsx(
            SENSITIVE_CONTENT_NO_SESSION_RECORDING,
            "border border-black rounded-t-md border-b-0",
            "focus:outline-none resize-none focus:ring-0",
            "w-full -mb-2 leading-[26px]",
          )}
          rows={6}
          placeholder="10000 cute good fence purity play despair worth year layer install drastic vote skirt noble sadness miss gadget kitten ladder traffic risk phone bamboo "
          onChange={(e) => setPhrase(e.target.value)}
        />
        <Button
          id="delete-recovery-button"
          error
          block
          className="rounded-t-none"
          onClick={handleDelete}
          disabled={phrase.split(" ").length < 11}
        >
          Remove recovery phrase
        </Button>
      </div>
    </ModalAdvanced>
  )
}

export default RecoveryPhraseDeleteModal
