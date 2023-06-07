import clsx from "clsx"
import React, { useState } from "react"
import { toast } from "react-toastify"

import { Button } from "frontend/ui/atoms/button"
import { CopyIcon } from "frontend/ui/atoms/icons/copy"
import { ModalAdvanced } from "frontend/ui/molecules/modal/advanced"

interface IAddRecoveryPhraseModal extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void
  phrase: string
}

const AddRecoveryPhraseModal: React.FC<IAddRecoveryPhraseModal> = ({
  onClose,
  phrase,
}) => {
  const [copied, setCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phrase)
    toast.success("Copied to clipboard")
    setCopied(true)
  }
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
      buttonsClassNames="py-3"
    >
      <div>
        <div
          className={clsx(
            "border-2 border-black rounded-t-md",
            "focus:outline-none resize-none focus:ring-0",
            "w-full font-mono leading-[26px] p-2",
          )}
        >
          {phrase}{" "}
        </div>
        <Button
          block
          className="flex justify-center space-x-2 border-2 border-t-0 border-black rounded-t-none"
          onClick={copyToClipboard}
          id="copy-button"
        >
          <CopyIcon className="text-black stroke-black" />
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>

        <div className="mt-5">
          <input
            type="checkbox"
            id="saved-checkbox"
            className="w-5 h-5 border-2 border-black rounded cursor-pointer"
            onChange={() => setIsSaved(!isSaved)}
            checked={isSaved}
          />
          <label
            htmlFor="saved-checkbox"
            className="ml-2 text-sm cursor-pointer"
          >
            I’ve saved this phrase in a safe place
          </label>
        </div>

        <Button
          id="recovery-save-button"
          block
          primary
          disabled={!copied || !isSaved}
          className="mt-5"
          onClick={onClose}
        >
          Done
        </Button>
      </div>
    </ModalAdvanced>
  )
}

export default AddRecoveryPhraseModal
