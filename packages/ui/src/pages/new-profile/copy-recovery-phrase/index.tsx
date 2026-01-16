import ProfileContainer from "packages/ui/src/atoms/profile-container/Container"
import React from "react"

import { Button, CopyIcon, P, ProfileTemplate } from "@nfid-frontend/ui"

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
