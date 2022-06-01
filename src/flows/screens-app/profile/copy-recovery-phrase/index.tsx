import React from "react"
import { useLocation } from "react-router-dom"

import { useNFIDNavigate } from "frontend/hooks/use-nfid-navigate"
import { CopyRecoveryPhrase as CopyRecoveryPhraseRaw } from "frontend/screens/profile/recovery-phrase"

import { ProfileConstants } from "../routes"

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
      onContinueButtonClick={navigateFactory(
        `${ProfileConstants.base}/${ProfileConstants.authenticate}`,
      )}
    />
  )
}
