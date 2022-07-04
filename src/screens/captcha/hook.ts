import { WebAuthnIdentity } from "@dfinity/identity"
import React from "react"
import { useLocation } from "react-router-dom"
import useSWR, { mutate } from "swr"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import {
  ChallengeResult,
  IIConnection,
} from "frontend/services/internet-identity/iiConnection"

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

  const { challenge } = useChallenge()

  const { onRegisterSuccess } = useAuthentication()

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

      const user = await onRegisterSuccess(response)
      if (response.kind === "badChallenge") {
        setLoading(false)
        onBadChallenge()
      }
      if (response.kind === "apiError") {
        setLoading(false)
        onApiError()
      }

      return { ...response, user }
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
      const user = onRegisterSuccess(response)
      if (response.kind === "badChallenge") {
        setLoading(false)
        onBadChallenge()
      }
      if (response.kind === "apiError") {
        setLoading(false)
        onApiError()
      }

      return { ...response, user }
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
    registerPayload,
    registerAnchor,
    registerAnchorFromGoogle,
  }
}

export const useChallenge = () => {
  const key = "challenge"
  const { data, error } = useSWR(key, async () => {
    console.time(">> getChallenge")
    const challengeResponse = await IIConnection.createChallenge()
    console.timeEnd(">> getChallenge")
    return challengeResponse
  })

  const loadNewChallenge = React.useCallback(() => mutate(key), [])

  const state = {
    challenge: data,
    error,
    isLoading: !error && !data,
    loadNewChallenge,
  }
  console.log(">> useChallenge", state)

  return state
}
