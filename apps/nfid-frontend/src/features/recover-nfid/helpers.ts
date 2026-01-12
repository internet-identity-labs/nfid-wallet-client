import { useCallback } from "react"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { parseUserNumber } from "frontend/integration/internet-identity/userNumber"

export const useHandleRecovery = (
  recoveryPhrase: string,
  resetError: () => void,
) => {
  const { loginWithRecovery } = useAuthentication()

  const stringUserNumber = recoveryPhrase.split(" ")[0]
  const userNumber = parseUserNumber(stringUserNumber)
  const seedPhrase = recoveryPhrase.split(`${userNumber} `)[1]

  const recoverNFID = useCallback(async () => {
    if (!userNumber) {
      throw new Error("Invalid Recovery Phrase (missing Anchor)")
    }

    let result = null

    try {
      resetError()
      result = await loginWithRecovery(seedPhrase, userNumber)
    } catch (_e) {
      throw new Error(
        "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
      )
    }

    if (result?.tag !== "ok") {
      throw new Error(
        "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
      )
    }

    return result
  }, [loginWithRecovery, resetError, seedPhrase, userNumber])

  return {
    userNumber,
    seedPhrase,
    recoverNFID,
  }
}
