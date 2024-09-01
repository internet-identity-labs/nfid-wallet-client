import clsx from "clsx"
import { ButtonAlt } from "packages/ui/src/atoms/button"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import React, { useMemo, useState } from "react"
import { toast } from "react-toastify"

import { IconCmpPlus } from "@nfid-frontend/ui"
import { SENSITIVE_CONTENT_NO_SESSION_RECORDING } from "@nfid/config"
import { securityTracking } from "@nfid/integration"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { generate } from "frontend/integration/internet-identity/crypto/mnemonic"
import { CopyIcon } from "frontend/ui/atoms/icons/copy"

import { IHandleWithLoading } from ".."
import { securityConnector } from "../device-connector"

interface IAddRecoveryPhraseModal extends React.HTMLAttributes<HTMLDivElement> {
  handleWithLoading: IHandleWithLoading
}

export const AddRecoveryPhrase: React.FC<IAddRecoveryPhraseModal> = ({
  handleWithLoading,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [copied, setCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const { profile } = useProfile()

  const phrase: string = useMemo(() => {
    return `${profile?.anchor} ${generate().trim()}`
  }, [profile?.anchor])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phrase)
    toast.success("Copied to clipboard")
    setCopied(true)
  }

  return (
    <div>
      <div
        className={clsx(
          "flex items-center space-x-2.5 pl-2.5 h-[61px] text-blue",
          "hover:opacity-50 cursor-pointer transition-opacity",
        )}
        onClick={() => setIsModalVisible(true)}
      >
        <IconCmpPlus className="w-[18px] h-[18px]" />
        <span className="text-sm font-bold">Add recovery phrase</span>
      </div>
      <ModalComponent
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        className="p-5 w-[95%] md:w-[450px] z-[100] lg:rounded-xl"
      >
        <p className="text-2xl font-bold">Add recovery phrase</p>
        <p className="mt-5 text-sm">
          This recovery phrase restores your NFID in case the devices you
          registered are lost. Keep this phrase secret, safe, offline, and only
          use it on <b>https://nfid.one</b>.
        </p>
        <div>
          <div
            className={clsx(
              SENSITIVE_CONTENT_NO_SESSION_RECORDING,
              "border-2 border-black rounded-t-md mt-4",
              "focus:outline-none resize-none focus:ring-0",
              "w-full leading-[26px] p-2",
            )}
          >
            {phrase}
          </div>
          <ButtonAlt
            block
            className="flex justify-center space-x-2 border-2 border-t-0 border-black rounded-t-none"
            onClick={copyToClipboard}
            id="copy-button"
          >
            <CopyIcon className="text-black stroke-black" />
            <span>{copied ? "Copied" : "Copy"}</span>
          </ButtonAlt>

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

          <ButtonAlt
            id="recovery-save-button"
            block
            primary
            disabled={!copied || !isSaved}
            className="mt-5"
            onClick={() =>
              handleWithLoading(
                async () => {
                  const response = await securityConnector.createRecoveryPhrase(
                    phrase,
                  )
                  securityTracking.recoveryPhraseAdded()
                  return response
                },
                () => setIsModalVisible(false),
              )
            }
          >
            Done
          </ButtonAlt>
        </div>
      </ModalComponent>
    </div>
  )
}
