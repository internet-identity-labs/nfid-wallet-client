import { useActor } from "@xstate/react"
import { decodeJwt } from "jose"
import toaster from "packages/ui/src/atoms/toast"
import {
  LoginEventHandler,
  SignInWithGoogle,
} from "packages/ui/src/molecules/button/signin-with-google"
import { Auth2FA } from "packages/ui/src/organisms/authentication/2fa"
import { AuthAddPasskey } from "packages/ui/src/organisms/authentication/auth-add-passkey"
import { AuthAddPasskeySuccess } from "packages/ui/src/organisms/authentication/auth-add-passkey/success"
import { AuthSelection } from "packages/ui/src/organisms/authentication/auth-selection"
import {
  AuthBackupWallet,
  AuthSaveRecoveryPhrase,
} from "packages/ui/src/organisms/authentication/backup-wallet"
import { AuthOtherSignOptions } from "packages/ui/src/organisms/authentication/other-sign-options.tsx"
import { AuthSignInWithRecoveryPhrase } from "packages/ui/src/organisms/authentication/sign-in-with-recovery-phrase"
import { AuthSignUpPassKey } from "packages/ui/src/organisms/authentication/sign-up-passkey"
import { ReactNode, useCallback, useMemo, useState } from "react"

import { Button, IconCmpGoogle } from "@nfid-frontend/ui"
import { getAllWalletsFromThisDevice } from "@nfid/integration"
import { useSWR } from "@nfid/swr"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { AuthEmailFlowCoordinator } from "frontend/features/authentication/auth-selection/email-flow/coordination"
import { AuthWithEmailActor } from "frontend/features/authentication/auth-selection/email-flow/machine"
import { securityConnector } from "frontend/features/security/device-connector"
import { useLoadProfileFromStorage } from "frontend/hooks"
import { generate } from "frontend/integration/internet-identity/crypto/mnemonic"
import { parseUserNumber } from "frontend/integration/internet-identity/userNumber"
import { AbstractAuthSession } from "frontend/state/authentication"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { authWithAnchor } from "../auth-selection/other-sign-options/services"
import { passkeyConnector } from "../auth-selection/passkey-flow/services"
import { AuthenticationMachineActor } from "./root-machine"

export default function AuthenticationCoordinator({
  actor,
  isIdentityKit = false,
  isEmbed = false,
  loader,
}: {
  actor: AuthenticationMachineActor
  isIdentityKit?: boolean
  isEmbed?: boolean
  loader?: ReactNode
}) {
  const { loginWithRecovery } = useAuthentication()
  const { storageProfile, storageProfileLoading } = useLoadProfileFromStorage()
  const [state, send] = useActor(actor)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)
  const [is2FALoading, setIs2FALoading] = useState(false)
  const [isOtherOptionsLoading, setIsOtherOptionsLoading] = useState(false)
  const [isAddPasskeyLoading, setIsAddPasskeyLoading] = useState(false)
  const [loginWithRecoverError, setLoginWithRecoverError] = useState("")
  const [signUpPasskeyLoading, setSignUpPasskeyLoading] = useState(false)
  const [loginWithRecoveryLoading, setLoginWithRecoveryLoading] =
    useState(false)
  const [captcha, setCaptcha] = useState<
    Awaited<ReturnType<typeof passkeyConnector.getCaptchaChallenge>> | undefined
  >()
  const [captchaEntered, setCaptchaEntered] = useState("")

  const onSelectGoogleAuth: LoginEventHandler = ({ credential }) => {
    send({
      type: "AUTH_WITH_GOOGLE",
      data: {
        jwt: credential,
        email: decodeJwt(credential).email as string,
        isEmbed,
      },
    })
  }

  const onAuthWithPasskey = (authSession: AbstractAuthSession) => {
    send({
      type: "SIGN_IN_PASSKEY",
      data: authSession,
    })
  }

  const handle2FAAuth = useCallback(async () => {
    setIs2FALoading(true)
    const onSuccess = (authSession: AbstractAuthSession) =>
      send({
        type: "AUTHENTICATED",
        data: authSession,
      })
    try {
      const res = await passkeyConnector.loginWithAllowedPasskey(
        state.context.allowedDevices,
      )
      onSuccess(res)
    } catch (e: any) {
      toaster.error(e?.message ?? "Invalid Passkey")
      console.error(e)
    } finally {
      setIs2FALoading(false)
    }
  }, [state.context.allowedDevices, send])

  const handleOtherOptionsAuth = useCallback(
    async (data: { anchor: number; withSecurityDevices: boolean }) => {
      try {
        setIsOtherOptionsLoading(true)
        const onSuccess = (authSession: AbstractAuthSession) =>
          send({
            type: "AUTHENTICATED",
            data: authSession,
          })
        const res = await authWithAnchor(data)
        onSuccess(res)
      } catch (e: any) {
        toaster.error(e.message)
      } finally {
        setIsOtherOptionsLoading(false)
      }
    },
    [send],
  )

  const onLoginWithPasskey = async (allowedPasskeys?: any[]) => {
    setIsPasskeyLoading(true)
    const res = await passkeyConnector.loginWithPasskey(
      undefined,
      () => {
        setIsPasskeyLoading(false)
      },
      allowedPasskeys ?? [],
    )

    onAuthWithPasskey(res)
  }

  const onSignUpWithPasskey = async (name: string, captchaVal: string) => {
    setSignUpPasskeyLoading(true)
    try {
      await passkeyConnector.registerWithPasskey(name, {
        challengeKey: captcha!.challenge_key,
        chars: captchaVal,
      })
      send({
        type: "AUTHENTICATED",
      })
    } catch (e) {
      toaster.error((e as Error).message)
    } finally {
      setSignUpPasskeyLoading(false)
    }
  }

  const onRecover = useCallback(
    async (value: string) => {
      const recoveryPhrase = value.replace(/\s+/g, " ").trim()

      const stringUserNumber = recoveryPhrase.split(" ")[0]
      const userNumber = parseUserNumber(stringUserNumber)
      const seedPhrase = recoveryPhrase.split(`${userNumber} `)[1]

      if (!userNumber) {
        return setLoginWithRecoverError(
          "Invalid Recovery Phrase (missing Anchor)",
        )
      }
      let result = null

      try {
        setLoginWithRecoverError("")
        setLoginWithRecoveryLoading(true)
        result = await loginWithRecovery(seedPhrase, userNumber)
        if (result?.tag !== "ok") {
          return setLoginWithRecoverError(
            "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
          )
        }
        send({
          type: "AUTHENTICATED",
          data: {
            anchor: result.profile.anchor,
            name: result.profile.name,
          } as unknown as AbstractAuthSession,
        })
      } catch (e: any) {
        console.error(e)
        return setLoginWithRecoverError(
          e?.message ??
            "We cannot restore your NFID with this recovery phrase. Please check it and try again.",
        )
      } finally {
        setLoginWithRecoveryLoading(false)
      }
    },
    [loginWithRecovery, send],
  )

  const recoveryPhrase: string = useMemo(() => {
    return `${state.context.authSession?.anchor} ${generate().trim()}`
  }, [state.context.authSession?.anchor])

  const {
    isLoading: isCaptchaLoading,
    isValidating: isCaptchaValidating,
    mutate: getCaptcha,
  } = useSWR(
    `get-captcha`,
    async () => {
      const challenge = await passkeyConnector.getCaptchaChallenge()
      setCaptcha(challenge)
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  )

  const walletName =
    state.context.email ??
    state.context.authSession?.name ??
    state.context.authSession?.anchor

  switch (true) {
    case state.matches("AuthSelection"):
      return (
        <AuthSelection
          isIdentityKit={isIdentityKit}
          getAllWalletsFromThisDevice={getAllWalletsFromThisDevice}
          onSelectEmailAuth={(email: string) => {
            send({
              type: "AUTH_WITH_EMAIL",
              data: {
                email,
                isEmbed,
              },
            })
          }}
          onSelectOtherAuth={() => {
            send({
              type: "AUTH_WITH_OTHER",
              data: { isEmbed },
            })
          }}
          isLoading={isPasskeyLoading}
          applicationURL={state.context.authRequest?.hostname}
          onLoginWithPasskey={onLoginWithPasskey}
          googleButton={
            <SignInWithGoogle
              onLogin={onSelectGoogleAuth}
              button={
                <Button
                  id="google-sign-button"
                  className="h-12 !p-0"
                  type="stroke"
                  icon={<IconCmpGoogle />}
                  block
                >
                  Continue with Google
                </Button>
              }
            />
          }
          onTypeChange={() => send({ type: "SIGN_UP" })}
        />
      )
    case state.matches("AuthSelectionSignUp"):
      return (
        <AuthSelection
          type="sign-up"
          isIdentityKit={isIdentityKit}
          getAllWalletsFromThisDevice={getAllWalletsFromThisDevice}
          onSelectEmailAuth={(email: string) => {
            send({
              type: "AUTH_WITH_EMAIL",
              data: {
                email,
                isEmbed,
              },
            })
          }}
          isLoading={isPasskeyLoading}
          applicationURL={state.context.authRequest?.hostname}
          onLoginWithPasskey={async () => {
            send({ type: "SIGN_UP_WITH_PASSKEY" })
          }}
          googleButton={
            <SignInWithGoogle
              onLogin={onSelectGoogleAuth}
              button={
                <Button
                  id="google-sign-button"
                  className="h-12 !p-0"
                  type="stroke"
                  icon={<IconCmpGoogle />}
                  block
                >
                  Continue with Google
                </Button>
              }
            />
          }
          onTypeChange={() => send({ type: "SIGN_IN" })}
        />
      )
    case state.matches("SignUpPassKey"):
      return (
        <AuthSignUpPassKey
          onPasskeyCreate={(name) => {
            onSignUpWithPasskey(name, captchaEntered)
          }}
          captchaEntered={!!captchaEntered}
          onCaptchaEntered={setCaptchaEntered}
          isPasskeyCreating={signUpPasskeyLoading}
          getCaptcha={getCaptcha}
          shouldFetchCaptcha={!captcha && !isCaptchaLoading && !isCaptchaValidating}
          captcha={
            Array.isArray(captcha?.png_base64)
              ? captcha?.png_base64[0]
              : captcha?.png_base64
          }
          isLoading={isCaptchaLoading || isCaptchaValidating}
          withLogo={!isIdentityKit}
          title={isIdentityKit ? "Sign up" : undefined}
          subTitle={isIdentityKit ? "to continue to" : "Sign up to continue to"}
          onBack={() => {
            send({ type: "BACK" })
            setCaptcha(undefined)
            setCaptchaEntered("")
          }}
          applicationURL={state.context.authRequest?.hostname}
        />
      )
    case state.matches("EmailAuthentication"):
      return (
        <AuthEmailFlowCoordinator
          isIdentityKit={isIdentityKit}
          actor={state.children.AuthWithEmailMachine as AuthWithEmailActor}
        />
      )
    case state.matches("SignInWithRecoveryPhrase"):
      return (
        <AuthSignInWithRecoveryPhrase
          withLogo={!isIdentityKit}
          title={isIdentityKit ? "Sign in" : undefined}
          subTitle={isIdentityKit ? "to continue to" : undefined}
          appMeta={state.context.authRequest?.hostname}
          onBack={() => {
            send({ type: "BACK" })
            setLoginWithRecoverError("")
          }}
          error={loginWithRecoverError}
          handleAuth={onRecover}
          isLoading={loginWithRecoveryLoading}
        />
      )
    case state.matches("BackupWallet"):
      return (
        <AuthBackupWallet
          name={walletName}
          onSkip={() => send({ type: "SKIP" })}
          onCreate={() => send({ type: "DONE" })}
          titleClassName={isIdentityKit ? "lg:text-[28px]" : undefined}
        />
      )
    case state.matches("BackupWalletSavePhrase"):
      return (
        <AuthSaveRecoveryPhrase
          name={walletName}
          onDone={() => {
            securityConnector.createRecoveryPhrase(recoveryPhrase).then(() => {
              send({ type: "DONE" })
            })
          }}
          recoveryPhrase={recoveryPhrase}
          titleClassName={isIdentityKit ? "lg:text-[28px]" : undefined}
        />
      )
    case state.matches("OtherSignOptions"):
      return (
        <AuthOtherSignOptions
          withLogo={!isIdentityKit}
          title={isIdentityKit ? "Sign in" : undefined}
          subTitle={isIdentityKit ? "to continue to" : undefined}
          applicationUrl={state.context.authRequest?.hostname}
          onBack={() => send({ type: "BACK" })}
          handleAuth={handleOtherOptionsAuth}
          onAuthWithRecoveryPhrase={() => {
            send({ type: "AUTH_WITH_RECOVERY_PHRASE" })
          }}
          isLoading={isOtherOptionsLoading || storageProfileLoading}
          profileAnchor={storageProfile?.anchor}
        />
      )
    case state.matches("TwoFA"):
      return (
        <Auth2FA
          email={state.context.email2FA}
          isIdentityKit={isIdentityKit}
          handleAuth={handle2FAAuth}
          isLoading={is2FALoading}
        />
      )
    case state.matches("AddPasskeys"):
      return (
        <AuthAddPasskey
          isLoading={isAddPasskeyLoading}
          name={walletName}
          onSkip={() => send({ type: "SKIP" })}
          onAdd={() => {
            setIsAddPasskeyLoading(true)
            passkeyConnector
              .createCredential()
              .then(() => send({ type: "CONTINUE" }))
              .catch(() => send({ type: "BACK" }))
              .finally(() => setIsAddPasskeyLoading(false))
          }}
          titleClassName={isIdentityKit ? "lg:text-[28px]" : undefined}
        />
      )
    case state.matches("AddPasskeysSuccess"):
      return (
        <AuthAddPasskeySuccess
          onFinish={() => {
            send({ type: "DONE" })
          }}
          name={walletName}
          titleClassName={isIdentityKit ? "lg:text-[28px]" : undefined}
        />
      )
    case state.matches("End"):
    default:
      return loader || <BlurredLoader isLoading />
  }
}
