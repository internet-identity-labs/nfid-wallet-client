import React from "react"

import { ChooseAccount } from "@nfid-frontend/ui"

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
        <div className="dark:text-white">
          for{" "}
          <a
            href={origin}
            target="_blank"
            className="no-underline text-primaryButtonColor dark:text-teal-500"
            rel="noreferrer"
          >
            {applicationName}
          </a>
        </div>
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
