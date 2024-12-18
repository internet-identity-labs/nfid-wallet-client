import clsx from "clsx"
import toaster from "packages/ui/src/atoms/toast"
import { ModalAdvanced } from "packages/ui/src/molecules/modal/advanced"
import React, { useState } from "react"

import { Button, Loader } from "@nfid-frontend/ui"

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
      toaster.error("Incorrect seed phrase")
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
          type="red"
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
