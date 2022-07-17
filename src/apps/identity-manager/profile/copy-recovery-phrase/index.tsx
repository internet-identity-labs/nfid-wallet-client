import React from "react"
import { useLocation } from "react-router-dom"

import { CopyRecoveryPhrase as CopyRecoveryPhraseRaw } from "frontend/design-system/pages/profile/recovery-phrase"

import { useNFIDNavigate } from "frontend/utils/use-nfid-navigate"

interface CopyRecoveryPhraseLocationState {
  recoveryPhrase: string
}

interface CopyRecoveryPhraseProps {}

export const CopyRecoveryPhrase: React.FC<CopyRecoveryPhraseProps> = () => {
  const { state } = useLocation()
  const { navigateFactory } = useNFIDNavigate()

  return (
    <CopyRecoveryPhraseRaw
      recoveryPhrase={(state as CopyRecoveryPhraseLocationState).recoveryPhrase}
      onContinueButtonClick={navigateFactory("/profile/authenticate")}
    />
  )
}
