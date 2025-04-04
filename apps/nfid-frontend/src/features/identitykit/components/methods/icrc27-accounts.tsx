import React from "react"

import { ChooseAccount } from "frontend/ui/organisms/choose-account"

import { Account } from "../../type"
import { RPCPromptTemplate } from "../templates/prompt-template"

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

  const applicationName = new URL(origin).host

  return (
    <RPCPromptTemplate
      title="Approve connection"
      subTitle={
        <>
          for{" "}
          <a
            href={origin}
            target="_blank"
            className="text-primaryButtonColor no-underline"
            rel="noreferrer"
          >
            {applicationName}
          </a>
        </>
      }
      onPrimaryButtonClick={() => {
        onApprove([selectedProfile])
      }}
      primaryButtonText="Connect"
    >
      <ChooseAccount
        onBack={onBack}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        publicProfile={publicProfile}
        anonymous={anonymous}
        verificationReport={{ isPublicAccountAvailable: true }}
      />
    </RPCPromptTemplate>
  )
}

export default RPCComponentICRC27
