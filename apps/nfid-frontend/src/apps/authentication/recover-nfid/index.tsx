import * as Sentry from "@sentry/browser"
import React, { useState } from "react"
import { FieldValues } from "react-hook-form"

import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { parseUserNumber } from "frontend/integration/internet-identity/userNumber"
import { RecoverNFID } from "frontend/ui/pages/recover-nfid"
import { useNFIDNavigate } from "frontend/ui/utils/use-nfid-navigate"

import { useAuthentication } from "../use-authentication"

interface RestoreAccessPointRecoveryPhraseProps {
  registerDeviceDeciderPath: string
  isVerifiedDomainDefault?: boolean
}

export const AppScreenRecoverNFID: React.FC<
  RestoreAccessPointRecoveryPhraseProps
> = ({ registerDeviceDeciderPath, isVerifiedDomainDefault }) => {
  const [responseError, setResponseError] = useState<any>(null)
  const [isVerifiedDomain, toggleIsVerifiedDomain] = React.useReducer(
    (state) => !state,
    !!isVerifiedDomainDefault,
  )
  const { refreshProfile } = useAccount()

  const { navigate } = useNFIDNavigate()
  const { loginWithRecovery, isLoading } = useAuthentication()

  const onRecover = React.useCallback(
    async (data: FieldValues) => {
      const recoveryPhrase = data.recoveryPhrase.replace(/\s+/g, " ").trim()

      const stringUserNumber = recoveryPhrase.split(" ")[0]
      const userNumber = parseUserNumber(stringUserNumber)
      const seedPhrase = recoveryPhrase.split(`${userNumber} `)[1]

      if (!userNumber) {
        return setResponseError("Invalid Recovery Phrase (missing Anchor)")
      }
      let result = null

      try {
        setResponseError("")
        result = await loginWithRecovery(seedPhrase, userNumber)
        await refreshProfile()
      } catch (e: any) {
        console.error(e)
        return setResponseError(
          e?.message ??
            "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
        )
      }

      if (result?.tag !== "ok") {
        return setResponseError(
          "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
        )
      }

      Sentry.setUser({ id: userNumber.toString() })
      navigate(registerDeviceDeciderPath, { state: { userNumber } })
    },
    [loginWithRecovery, navigate, refreshProfile, registerDeviceDeciderPath],
  )

  return (
    <RecoverNFID
      onRecover={onRecover}
      toggle={toggleIsVerifiedDomain}
      isVerifiedDomain={isVerifiedDomain}
      responseError={responseError}
      isLoading={isLoading}
    />
  )
}

export default AppScreenRecoverNFID
