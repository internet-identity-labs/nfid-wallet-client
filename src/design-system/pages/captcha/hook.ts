import { WebAuthnIdentity } from "@dfinity/identity"
import React from "react"
import { useLocation } from "react-router-dom"
import useSWR from "swr"

import { useIsLoading } from "frontend/design-system/templates/app-screen/use-is-loading"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { IIConnection } from "frontend/comm/services/internet-identity/iiConnection"
import {
  ChallengeResult,
  createChallenge,
} from "frontend/integration/internet-identity"

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

      if (response.kind === "badChallenge") {
        setLoading(false)
        return onBadChallenge()
      }
      if (response.kind === "apiError") {
        setLoading(false)
        return onApiError()
      }

      const user = await onRegisterSuccess(response)
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
      if (response.kind === "badChallenge") {
        setLoading(false)
        return onBadChallenge()
      }
      if (response.kind === "apiError") {
        setLoading(false)
        return onApiError()
      }

      const user = await onRegisterSuccess(response)

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

const THREE_MIN_IN_MS = 1000 * 60 * 3
export const useChallenge = () => {
  const key = "challenge"

  const { data, error, mutate } = useSWR(
    key,
    async () => {
      console.time("getChallenge")
      const challengeResponse = await createChallenge()
      console.timeEnd("getChallenge")
      return challengeResponse
    },
    {
      focusThrottleInterval: THREE_MIN_IN_MS,
      dedupingInterval: THREE_MIN_IN_MS,
    },
  )

  const loadNewChallenge = React.useCallback(() => {
    mutate(undefined)
  }, [mutate])

  return {
    challenge: data,
    error,
    isLoading: !error && !data,
    loadNewChallenge,
  }
}
