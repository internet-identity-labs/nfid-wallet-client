import React from "react"
import { useLocation } from "react-router-dom"

import { useAuthorization } from "frontend/hooks/use-authorization"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useUnknownDeviceConfig } from "frontend/screens/authorize-app-unknown-device/hooks/use-unknown-device.config"
import { CopyRecoveryPhrase } from "frontend/screens/copy-recovery-phrase"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { usePersona } from "frontend/services/identity-manager/persona/hooks"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"

interface RouteCopyRecoveryPhraseProps {}

interface LocationState {
  recoveryPhrase: string
}

export const RouteCopyRecoveryPhrase: React.FC<
  RouteCopyRecoveryPhraseProps
> = () => {
  const { scope } = useUnknownDeviceConfig()
  const { isLoading, setIsloading } = useIsLoading()
  const { state } = useLocation()
  const { userNumber } = useAccount()

  const { authorizeApp } = useAuthorization({
    userNumber,
  })

  const recoveryPhrase = React.useMemo(
    () => (state as LocationState)?.recoveryPhrase,
    [state],
  )

  const { nextPersonaId, createPersona } = usePersona()

  const handleAuthorizePersona = React.useCallback(async () => {
    setIsloading(true)
    const response = await createPersona({ domain: scope })

    if (response?.status_code === 200) {
      await authorizeApp({ persona_id: nextPersonaId, domain: scope })
      setIsloading(false)
    }
    console.error(response)
  }, [authorizeApp, createPersona, nextPersonaId, scope, setIsloading])

  return (
    <CopyRecoveryPhrase
      recoveryPhrase={recoveryPhrase}
      continueButtonText={"Continue"}
      onContinueButtonClick={handleAuthorizePersona}
      isLoading={isLoading}
    />
  )
}
