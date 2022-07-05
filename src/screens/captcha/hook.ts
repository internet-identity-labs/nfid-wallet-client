import { WebAuthnIdentity } from "@dfinity/identity"
import { useAtom } from "jotai"
import React from "react"
import { useLocation } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import {
  ChallengeResult,
  IIConnection,
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

  const registerAnchorFromGoogle = React.useCallback(
    async ({ captcha }: { captcha: string }) => {
      setLoading(true)
      if (!challenge) throw new Error("No challenge response")
      const { identity, deviceName } = registerPayload

      const challengeResult: ChallengeResult = {
        chars: captcha,
        key: challenge.challenge_key,
      }

      const response = await IIConnection.registerFromGoogle(
        identity,
        deviceName,
        challengeResult,
      )
      onRegisterSuccess(response)
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

  return {
    loading,
    setLoading,
    challenge,
    requestCaptcha,
    registerPayload,
    registerAnchor,
    registerAnchorFromGoogle,
  }
}

export const useChallenge = () => {
  const [challenge, setChallengeResponse] = useAtom(challengeAtom)

  const getChallenge = React.useCallback(async () => {
    if (challenge) {
      setChallengeResponse(undefined)
    }
    console.time(">> getChallenge")
    const challengeResponse = await IIConnection.createChallenge()
    console.timeEnd(">> getChallenge")

    setChallengeResponse(challengeResponse)
  }, [challenge, setChallengeResponse])

  return { challenge, getChallenge }
}
