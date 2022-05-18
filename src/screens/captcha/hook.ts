import { WebAuthnIdentity } from "@dfinity/identity"
import { useAtom } from "jotai"
import React from "react"
import { useLocation } from "react-router-dom"

import { useAuthentication } from "frontend/hooks/use-authentication"
import { useIsLoading } from "frontend/hooks/use-is-loading"
import { useAccount } from "frontend/services/identity-manager/account/hooks"
import { fromMnemonicWithoutValidation } from "frontend/services/internet-identity/crypto/ed25519"
import { generate } from "frontend/services/internet-identity/crypto/mnemonic"
import {
  ChallengeResult,
  IC_DERIVATION_PATH,
  IIConnection,
  RegisterResult,
} from "frontend/services/internet-identity/iiConnection"

import { captchaStateAtom } from "./state"

interface RegisterPayload {
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
  const { registerPayload } = state as RegisterAccountCaptchaState

  const [captchaResp, setCaptchaResp] = useAtom(captchaStateAtom)
  const [responseRegisterAnchor, setResponseRegisterAnchor] = React.useState<
    RegisterResult | undefined
  >()

  // ACCOUNT
  const { account, createAccount } = useAccount()

  // RECOVERY_PHRASE
  const [recoveryPhrase, setRecoveryPhrase] = React.useState<
    string | undefined
  >()

  const { onRegisterSuccess } = useAuthentication()

  const requestCaptcha = React.useCallback(async () => {
    setLoading(true)

    const cha = await IIConnection.createChallenge()

    setCaptchaResp(cha)
    setLoading(false)
  }, [setCaptchaResp, setLoading])

  React.useEffect(() => {
    !captchaResp && requestCaptcha()
  }, [captchaResp, requestCaptcha, setCaptchaResp])

  const registerAnchor = React.useCallback(
    async ({ captcha }) => {
      setLoading(true)
      if (!captchaResp) throw new Error("No challenge response")
      const { identity, deviceName } = registerPayload

      const webAuthnIdentity = WebAuthnIdentity.fromJSON(identity)

      const challengeResult: ChallengeResult = {
        chars: captcha,
        key: captchaResp.challenge_key,
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
      captchaResp,
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

  const handleCreateRecoveryPhrase = React.useCallback(async () => {
    if (
      responseRegisterAnchor &&
      responseRegisterAnchor.kind === "loginSuccess"
    ) {
      const { userNumber, internetIdentity } = responseRegisterAnchor

      const recovery = generate().trim()
      const recoverIdentity = await fromMnemonicWithoutValidation(
        recovery,
        IC_DERIVATION_PATH,
      )

      // TODO: store as access point
      await internetIdentity.add(
        userNumber,
        "Recovery phrase",
        { seed_phrase: null },
        { recovery: null },
        recoverIdentity.getPublicKey().toDer(),
      )
      setRecoveryPhrase(`${userNumber} ${recovery}`)
      console.log(">> handleCreateRecoveryPhrase", { userNumber, recovery })
    }
  }, [responseRegisterAnchor])

  React.useEffect(() => {
    if (
      responseRegisterAnchor &&
      responseRegisterAnchor.kind === "loginSuccess"
    ) {
      handleCreateRecoveryPhrase()
      handleCreateAccount()
    }
  }, [handleCreateAccount, handleCreateRecoveryPhrase, responseRegisterAnchor])

  return {
    account,
    recoveryPhrase,
    loading,
    setLoading,
    captchaResp,
    requestCaptcha,
    registerPayload,
    registerAnchor,
  }
}
