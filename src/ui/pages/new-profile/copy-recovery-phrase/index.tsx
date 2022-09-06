import React from "react"

import { P, Button, CopyIcon } from "@internet-identity-labs/nfid-sdk-react"

import ProfileContainer from "frontend/ui/templates/profile-container/Container"
import ProfileTemplate from "frontend/ui/templates/profile-template/Template"

interface ProfileCopyPhrasePageProps {
  recoveryPhrase: string
  continueButtonText: string
  onContinueButtonClick: () => void
}

const ProfileCopyPhrasePage: React.FC<ProfileCopyPhrasePageProps> = ({
  recoveryPhrase,
  continueButtonText,
  onContinueButtonClick,
}) => {
  const [copied, setCopied] = React.useState(false)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveryPhrase).then(function () {
      setCopied(true)
    })
  }
  return (
    <ProfileTemplate>
      <ProfileContainer>
        <div className="p-4 border rounded-t border-black-base">
          <P className="font-mono">{recoveryPhrase}</P>
        </div>

        <Button
          primary
          className="!rounded-t-none w-full flex items-center justify-center space-x-3 focus:outline-none"
          onClick={() => copyToClipboard()}
        >
          <CopyIcon />
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>

        <Button
          onClick={onContinueButtonClick}
          disabled={!copied}
          primary
          large
          className="mt-8"
        >
          {continueButtonText}
        </Button>
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ProfileCopyPhrasePage
