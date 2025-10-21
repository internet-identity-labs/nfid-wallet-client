import clsx from "clsx"
import toaster from "packages/ui/src/atoms/toast"
import { ModalComponent } from "packages/ui/src/molecules/modal/index-v0"
import React, { useMemo, useState } from "react"

import { Button, IconCmpPlus } from "@nfid-frontend/ui"

import { useProfile } from "frontend/integration/identity-manager/queries"
import { generate } from "frontend/integration/internet-identity/crypto/mnemonic"
import { CopyIcon } from "frontend/ui/atoms/icons/copy"

import { IHandleWithLoading } from ".."
import { securityConnector } from "../device-connector"
import { Spinner } from "packages/ui/src/atoms/spinner"

interface IAddRecoveryPhraseModal extends React.HTMLAttributes<HTMLDivElement> {
  handleWithLoading: IHandleWithLoading
}

export const AddRecoveryPhrase: React.FC<IAddRecoveryPhraseModal> = ({
  handleWithLoading,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [copied, setCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { profile } = useProfile()

  const phrase: string = useMemo(() => {
    return `${profile?.anchor} ${generate().trim()}`
  }, [profile?.anchor])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phrase)
    toaster.success("Copied to clipboard")
    setCopied(true)
  }

  return (
    <div>
      <Button
        isSmall
        onClick={() => setIsModalVisible(true)}
        icon={<IconCmpPlus className="w-[18px] h-[18px]" />}
        type="ghost"
        className="text-sm font-bold mt-[20px]"
      >
        Add recovery phrase
      </Button>
      <ModalComponent
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        className="p-5 w-[95%] md:w-[450px] z-[100]"
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
              "border-2 border-black dark:border-white rounded-t-[12px] mt-4",
              "focus:outline-none resize-none focus:ring-0",
              "w-full leading-[26px] p-[12px] pb-[30px]",
            )}
          >
            {phrase}
          </div>
          <div
            className={clsx(
              "flex items-center justify-center space-x-2 h-[48px]",
              "border-2 border-t-0 border-black dark:border-white cursor-pointer",
              "rounded-[12px] rounded-t-none",
            )}
            onClick={copyToClipboard}
            id="copy-button"
          >
            <CopyIcon className="text-black stroke-black dark:text-white dark:stroke-white" />
            <span className="text-sm font-bold">
              {copied ? "Copied" : "Copy"}
            </span>
          </div>

          <div className="mt-5">
            <input
              type="checkbox"
              id="saved-checkbox"
              className={clsx(
                "w-5 h-5 border-black rounded cursor-pointer border-1 dark:border-white dark:bg-transparent",
                isSaved &&
                  "dark:bg-primaryButtonColor dark:border-primaryButtonColor",
              )}
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
            icon={isLoading ? <Spinner className="w-5 h-5 text-white" /> : null}
            disabled={!copied || !isSaved || isLoading}
            className="mt-5"
            onClick={() =>
              handleWithLoading(
                async () => {
                  setIsLoading(true)
                  const response =
                    await securityConnector.createRecoveryPhrase(phrase)
                  setIsLoading(false)
                  return response
                },
                () => setIsModalVisible(false),
              )
            }
          >
            Done
          </Button>
        </div>
      </ModalComponent>
    </div>
  )
}
