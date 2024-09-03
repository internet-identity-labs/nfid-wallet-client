import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import React from "react"

import { Button } from "@nfid-frontend/ui"

import { CopyIcon } from "frontend/ui/atoms/icons/copy"
import { P } from "frontend/ui/atoms/typography/paragraph"
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
        <div className="p-4 border border-black rounded-t">
          <P>{recoveryPhrase}</P>
        </div>

        <Button
          className="!rounded-t-none w-full flex items-center justify-center space-x-3 focus:outline-none"
          onClick={() => copyToClipboard()}
        >
          <CopyIcon />
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>

        <Button
          onClick={onContinueButtonClick}
          disabled={!copied}
          className="mt-8"
        >
          {continueButtonText}
        </Button>
      </ProfileContainer>
    </ProfileTemplate>
  )
}

export default ProfileCopyPhrasePage
