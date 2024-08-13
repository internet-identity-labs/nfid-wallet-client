import React from "react"

import { ChooseAccount } from "frontend/ui/organisms/choose-account"

import { Account } from "../../type"
import { RPCPromptTemplate } from "../templates/prompt-template"

export interface IRPCComponentICRC27 {
  publicProfile: Account
  anonymous: Account[]
  onApprove: (data: Account[]) => void
  onReject: () => void
  onBack: () => void
}

const RPCComponentICRC27 = ({
  publicProfile,
  anonymous,
  onApprove,
  onReject,
  onBack,
}: IRPCComponentICRC27) => {
  const [selectedProfile, setSelectedProfile] =
    React.useState<Account>(publicProfile)

  const applicationName = new URL(origin).host

  return (
    <RPCPromptTemplate
      subTitle={
        <>
          Wallet permissions for{" "}
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
      onPrimaryButtonClick={() => onApprove([selectedProfile])}
      onSecondaryButtonClick={onReject}
    >
      <ChooseAccount
        onBack={onBack}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        publicProfile={publicProfile}
        anonymous={anonymous}
        isPublicAvailable={true}
      />
    </RPCPromptTemplate>
  )
}

export default RPCComponentICRC27
