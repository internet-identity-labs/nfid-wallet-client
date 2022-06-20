import { WebAuthnIdentity } from "@dfinity/identity"
import { useAtom } from "jotai"
import React from "react"
import { useLocation } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import {
  ChallengeResult,
  IIConnection,
  RegisterResult,
} from "frontend/services/internet-identity/iiConnection"

import { challengeAtom } from "./state"

interface RegisterPayload {
  isGoogle?: boolean
  identity: string
  deviceName: string
}

interface RegisterAccountCaptchaState {
  registerPayload: RegisterPayload
}

interface UseCaptcha {
  onBadChallenge: () => void
  onApiError: () => void
}

export const useCaptcha = ({ onBadChallenge, onApiError }: UseCaptcha) => {
  const { isLoading: loading, setIsloading: setLoading } = useIsLoading()
  const { state } = useLocation()
  const { registerPayload } = (state as RegisterAccountCaptchaState) ?? {
    identity: "identity",
    deviceName: "deviceName",
  }

  const { challenge, getChallenge } = useChallenge()

  const [responseRegisterAnchor, setResponseRegisterAnchor] = React.useState<
    RegisterResult | undefined
  >()

  // ACCOUNT
  const { account, createAccount } = useAccount()

  const { onRegisterSuccess } = useAuthentication()

  const requestCaptcha = React.useCallback(async () => {
    await getChallenge()
  }, [getChallenge])

  const registerAnchor = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      setLoading(true)
      if (!challenge) throw new Error("No challenge response")
      const { identity, deviceName } = registerPayload

      const webAuthnIdentity = WebAuthnIdentity.fromJSON(identity)

      const challengeResult: ChallengeResult = {
        chars: captcha,
        key: challenge.challenge_key,
      }

      const response = await IIConnection.register(
        webAuthnIdentity,
        deviceName,
        challengeResult,
      )
      onRegisterSuccess(response)
      if (response.kind === "loginSuccess") {
        setResponseRegisterAnchor(response)
      }
      if (response.kind === "badChallenge") {
        setLoading(false)
        onBadChallenge()
      }
      if (response.kind === "apiError") {
        setLoading(false)
        onApiError()
      }

      return response
    },
    [
      challenge,
      onApiError,
      onBadChallenge,
      onRegisterSuccess,
      registerPayload,
      setLoading,
    ],
  )

  const handleCreateAccount = React.useCallback(async () => {
    if (
      responseRegisterAnchor &&
      responseRegisterAnchor.kind === "loginSuccess"
    ) {
      const { userNumber } = responseRegisterAnchor

      await createAccount({
        anchor: userNumber,
      })
    }
  }, [createAccount, responseRegisterAnchor])

  React.useEffect(() => {
    if (
      responseRegisterAnchor &&
      responseRegisterAnchor.kind === "loginSuccess"
    ) {
      handleCreateAccount()
    }
  }, [handleCreateAccount, responseRegisterAnchor])

  return {
    account,
    loading,
    setLoading,
    challenge,
    requestCaptcha,
    registerPayload,
    registerAnchor,
  }
}

export const useChallenge = () => {
  const [challenge, setChallengeResponse] = useAtom(challengeAtom)

  const getChallenge = React.useCallback(async () => {
    console.log(">> getChallenge", {})

    if (challenge) {
      setChallengeResponse(undefined)
    }
    const challengeResponse = await IIConnection.createChallenge()
    console.log(">> getChallenge", { challengeResponse })

    setChallengeResponse(challengeResponse)
  }, [challenge, setChallengeResponse])

  return { challenge, getChallenge }
}
