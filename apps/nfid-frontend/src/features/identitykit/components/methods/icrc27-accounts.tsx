import React from "react"

import { SNS_STEP_VISITED } from "frontend/features/authentication/constants"
import { ChooseAccount } from "frontend/ui/organisms/choose-account"

import { Account } from "../../type"
import { RPCPromptTemplate } from "../templates/prompt-template"
import { TokenLaunch } from "../token-launch"

export interface IRPCComponentICRC27 {
  origin: string
  publicProfile: Account
  anonymous: Account[]
  onApprove: (data: Account[]) => void
  onBack: () => void
}

const RPCComponentICRC27 = ({
  origin,
  publicProfile,
  anonymous,
  onApprove,
  onBack,
}: IRPCComponentICRC27) => {
  const [selectedProfile, setSelectedProfile] =
    React.useState<Account>(publicProfile)
  const [showTokenLaunch, setShowTokenLaunch] = React.useState(false)

  const applicationName = new URL(origin).host

  return showTokenLaunch ? (
    <TokenLaunch onSubmit={() => onApprove([selectedProfile])} />
  ) : (
    <RPCPromptTemplate
      title="Approve connection"
      subTitle={
        <>
          for{" "}
          <a
            href={origin}
            target="_blank"
            className="text-[#146F68] no-underline"
            rel="noreferrer"
          >
            {applicationName}
          </a>
        </>
      }
      onPrimaryButtonClick={() => {
        if (!!localStorage.getItem(SNS_STEP_VISITED)) {
          onApprove([selectedProfile])
        } else {
          setShowTokenLaunch(true)
        }
      }}
      primaryButtonText="Connect"
    >
      <ChooseAccount
        onBack={onBack}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        publicProfile={publicProfile}
        anonymous={anonymous}
        getVerificationReport={() => Promise.resolve({isPublicAccountAvailable: true})}
      />
    </RPCPromptTemplate>
  )
}

export default RPCComponentICRC27
