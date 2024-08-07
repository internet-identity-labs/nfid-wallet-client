import React from "react"

import { ChooseAccount } from "frontend/ui/organisms/choose-account"

import { Account } from "../../type"
import { RPCPromptTemplate } from "../templates/prompt-template"

export interface IRPCComponentICRC34 {
  publicProfile: Account
  anonymous: Account[]
  isPublicAvailable: boolean
  onApprove: (data: Account) => void
  onReject: () => void
}

const RPCComponentICRC34 = ({
  publicProfile,
  anonymous,
  isPublicAvailable,
  onApprove,
  onReject,
}: IRPCComponentICRC34) => {
  const [selectedProfile, setSelectedProfile] = React.useState<Account>(
    isPublicAvailable ? publicProfile : anonymous[0],
  )

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
      onPrimaryButtonClick={() => onApprove(selectedProfile)}
      onSecondaryButtonClick={onReject}
    >
      <ChooseAccount
        isPublicAvailable={false}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        publicProfile={publicProfile}
        anonymous={anonymous}
      />
    </RPCPromptTemplate>
  )
}

export default RPCComponentICRC34
