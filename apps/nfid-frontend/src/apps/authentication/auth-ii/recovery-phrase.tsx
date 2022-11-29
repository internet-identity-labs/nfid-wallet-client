import { DelegationIdentity } from "@dfinity/identity"
import React, { useState } from "react"
import { useForm } from "react-hook-form"

import { IIAuthRecovery } from "@nfid-frontend/ui"

import { createProfile } from "frontend/integration/identity-manager"
import { useAccount } from "frontend/integration/identity-manager/account/hooks"
import { parseUserNumber } from "frontend/integration/internet-identity/userNumber"
import { AuthSession } from "frontend/state/authentication"

import { useAuthentication } from "../use-authentication"

interface IIAuthRecoveryPhraseProps {
  onBack: () => void
  onSuccess: (authSession: AuthSession) => void
}

export const IIAuthRecoveryPhrase: React.FC<IIAuthRecoveryPhraseProps> = ({
  onBack,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [responseError, setResponseError] = useState<string>("")

  const { loginWithRecovery } = useAuthentication()
  const { recoverAccount } = useAccount()

  const { register, watch } = useForm()
  const recoveryPhrase = watch("recoveryPhrase")

  const onRecover = React.useCallback(async () => {
    setIsLoading(true)

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
    } catch (e) {
      console.error(e)
      setIsLoading(false)
      return setResponseError(
        "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
      )
    }

    if (result?.tag !== "ok") {
      setIsLoading(false)
      return setResponseError(
        "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
      )
    }

    try {
      await recoverAccount(BigInt(userNumber), false)
    } catch (e) {
      console.warn("NFID account not found. Recreating")
      createProfile(Number(userNumber))
    }

    const authSession: AuthSession = {
      anchor: Number(userNumber),
      identity: result.sessionKey,
      delegationIdentity: DelegationIdentity.fromDelegation(
        result.sessionKey,
        result.chain,
      ),
      sessionSource: "ii",
    }

    onSuccess(authSession)
    setIsLoading(false)
  }, [loginWithRecovery, onSuccess, recoverAccount, recoveryPhrase])

  return (
    <IIAuthRecovery
      onBack={onBack}
      onRecover={onRecover}
      fieldProps={{ ...register("recoveryPhrase") }}
      responseError={responseError}
      isLoading={isLoading}
    />
  )
}
