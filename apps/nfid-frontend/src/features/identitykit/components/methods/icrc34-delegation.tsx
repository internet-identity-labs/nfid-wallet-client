import React, { useState } from "react"

import { ChooseAccount } from "frontend/ui/organisms/choose-account"

import { Account } from "../../type"
import { RPCPromptTemplate } from "../templates/prompt-template"
import { TokenLaunch } from "../token-launch"

export interface IRPCComponentICRC34 {
  origin: string
  publicProfile: Account
  anonymous: Account[]
  isPublicAvailable: boolean
  onApprove: (data: Account) => void
  onBack: () => void
}

const RPCComponentICRC34 = ({
  origin,
  publicProfile,
  anonymous,
  isPublicAvailable,
  onApprove,
  onBack,
}: IRPCComponentICRC34) => {
  const [selectedProfile, setSelectedProfile] = React.useState<Account>(
    isPublicAvailable ? publicProfile : anonymous[0],
  )
  const [showTokenLaunch, setShowTolenLaunch] = useState(false)

  const applicationName = new URL(origin).host

  return showTokenLaunch ? (
    <TokenLaunch onSubmit={() => onApprove(selectedProfile)} />
  ) : (
    <RPCPromptTemplate
      title="Wallet permissions"
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
      onPrimaryButtonClick={() => setShowTolenLaunch(true)}
      primaryButtonText="Connect"
    >
      <ChooseAccount
        onBack={onBack}
        isPublicAvailable={isPublicAvailable}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        publicProfile={publicProfile}
        anonymous={anonymous}
      />
    </RPCPromptTemplate>
  )
}

export default RPCComponentICRC34
