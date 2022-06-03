import { P, Button, CopyIcon, H4 } from "@internet-identity-labs/nfid-sdk-react"
import clsx from "clsx"
import React from "react"

import { CONTAINER_CLASSES } from "frontend/design-system/atoms/container"
import { Input } from "frontend/design-system/atoms/input"
import { ProfileScreen } from "frontend/design-system/templates/ProfileScreen"

interface CopyRecoveryPhraseProps {
  recoveryPhrase: string
  onContinueButtonClick: () => void
}

export const CopyRecoveryPhrase: React.FC<CopyRecoveryPhraseProps> = ({
  recoveryPhrase,
  onContinueButtonClick,
}) => {
  const [confirmed, setConfirmed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryPhrase).then(function () {
      setCopied(true)
    })
  }

  return (
    <ProfileScreen>
      <div className={clsx("md:max-w-[80%]", CONTAINER_CLASSES)}>
        <H4 className="mt-5 md:mt-0">Recovery phrase</H4>
        <p className="mt-4 text-sm md:mt-14">
          This recovery phrase restores your NFID in case the devices you
          registered are lost. Keep this secret, safe, offline, and only use it
          on{" "}
          <a
            className="font-bold"
            href="https://nfid.one"
            target="_blank"
            rel="noreferrer"
          >
            https://nfid.one
          </a>
          .
        </p>

        <div className="p-4 mt-6 border rounded-t border-black-base">
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

        <div className="flex mt-5 space-x-2 text-sm ">
          <Input
            id="copied"
            className="w-[22px]"
            type="checkbox"
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <label htmlFor="copied" className="cursor-pointer">
            I’ve saved this recovery phrase in a safe place
          </label>
        </div>

        <Button
          onClick={onContinueButtonClick}
          disabled={!copied || !confirmed}
          secondary
          large
          className="mt-5"
        >
          Done
        </Button>
      </div>
    </ProfileScreen>
  )
}
