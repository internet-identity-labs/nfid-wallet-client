import {
  P,
  Button,
  CopyIcon,
  Loader,
  Modal,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { CONTAINER_CLASSES } from "frontend/design-system/atoms/container"
import { AppScreen } from "frontend/design-system/templates/AppScreen"

interface CopyRecoveryPhraseProps {
  recoveryPhrase: string
  continueButtonText: string
  onContinueButtonClick: () => void
  successModalText?: string
  showSuccessModal?: boolean
  onSuccessModalClick?: () => void
  isLoading?: boolean
  applicationName?: string
}

export const CopyRecoveryPhrase: React.FC<CopyRecoveryPhraseProps> = ({
  applicationName = "NFID",
  recoveryPhrase,
  continueButtonText,
  onContinueButtonClick,
  showSuccessModal,
  successModalText,
  onSuccessModalClick,
  isLoading = false,
}) => {
  const [copied, setCopied] = React.useState(false)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryPhrase).then(function () {
      setCopied(true)
    })
  }
  return (
    <AppScreen isFocused showLogo>
      {/* <H5 className="mt-8">This device is now equipped for Web 3.0</H5> */}
      <main className={clsx("flex flex-1")}>
        <div className={clsx(CONTAINER_CLASSES)}>
          <div className="grid h-full grid-cols-12">
            <div className="flex flex-col col-span-12 md:col-span-11 lg:col-span-7">
              <div className="text-base font-bold text-gray-400 md:text-xl">
                {applicationName}
              </div>
              <h1 className="mt-3 mb-3 text-5xl font-bold leading-10">
                Recovery phrase
              </h1>

              <div className="mb-6">
                This recovery phrase restores your NFID in case the devices you
                registered are lost. Keep this secret, safe, offline, and only
                use it on https://nfid.one.
              </div>

              <div className="p-4 border rounded-t border-black-base">
                <P className="font-mono">{recoveryPhrase}</P>
              </div>

              <Button
                secondary
                className="!rounded-t-none w-full flex items-center justify-center space-x-3 focus:outline-none"
                onClick={() => copyToClipboard()}
              >
                <CopyIcon />
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>

              <Button
                onClick={onContinueButtonClick}
                disabled={!copied}
                secondary
                large
                className="mt-8"
              >
                {continueButtonText}
              </Button>
              <div className="flex-grow" />
              <div className="opacity-0.4 mb-6 mt-6 opacity-40 text-xs">
                NFID is a privacy-preserving, one-touch multi-factor wallet
                protocol used by {applicationName} and developed by Internet
                Identity Labs.
              </div>
            </div>
          </div>
          <Loader isLoading={isLoading} />
          {showSuccessModal ? (
            <Modal
              title={"Success!"}
              description={successModalText}
              buttonText="Done"
              iconType="success"
              onClick={onSuccessModalClick}
            />
          ) : null}
        </div>
      </main>
    </AppScreen>
  )
}
