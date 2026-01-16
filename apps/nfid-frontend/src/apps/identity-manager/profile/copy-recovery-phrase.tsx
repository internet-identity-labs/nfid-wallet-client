import React from "react"
import { useLocation } from "react-router-dom"

import { ProfilePhraseCopyPage } from "@nfid-frontend/ui"
import { useNFIDNavigate } from "@nfid-frontend/ui"

import { ProfileConstants } from "./routes"

interface CopyRecoveryPhraseLocationState {
  recoveryPhrase: string
}

interface CopyRecoveryPhraseProps {}

const CopyRecoveryPhrase: React.FC<CopyRecoveryPhraseProps> = () => {
  const { state } = useLocation()
  const { navigateFactory } = useNFIDNavigate()

  return (
    <ProfilePhraseCopyPage
      recoveryPhrase={(state as CopyRecoveryPhraseLocationState).recoveryPhrase}
      onContinueButtonClick={navigateFactory(ProfileConstants.security)}
      continueButtonText={"Done"}
    />
  )
}

export default CopyRecoveryPhrase
