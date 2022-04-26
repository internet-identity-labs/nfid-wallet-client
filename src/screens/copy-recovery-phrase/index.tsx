import {
  H5,
  Card,
  CardBody,
  H2,
  P,
  Button,
  CopyIcon,
  Loader,
  Modal,
} from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { AppScreen } from "frontend/design-system/templates/AppScreen"

interface CopyRecoveryPhraseProps {
  recoveryPhrase: string
  continueButtonText: string
  onContinueButtonClick: () => void
  successModalText?: string
  showSuccessModal?: boolean
  onSuccessModalClick?: () => void
  isLoading?: boolean
}

export const CopyRecoveryPhrase: React.FC<CopyRecoveryPhraseProps> = ({
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
    <AppScreen isFocused>
      {/* <H5 className="mt-8">This device is now equipped for Web 3.0</H5> */}
      <main className={clsx("flex flex-1")}>
        <div className="container px-6 py-0 mx-auto sm:py-4">
          <Card className="grid grid-cols-12">
            <CardBody className="col-span-12 py-0 md:col-span-11 lg:col-span-7 sm:py-6">
              <H2 className="my-4 leading-10">Your NFID is ready</H2>

              <P className="my-6">
                This recovery phrase is the only backup to access your NFID in
                case all other access points are lost. Keep this secret, safe,
                and offline!
              </P>

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
            </CardBody>
          </Card>
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
