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
  const [signUpPasskeyError, setSignUpPasskeyError] = useState("")
  const [signUpPasskeyLoading, setSignUpPasskeyLoading] = useState(false)
  const [loginWithRecoveryLoading, setLoginWithRecoveryLoading] =
    useState(false)

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

  const onSignUpWithPasskey = async (name: string) => {
    setSignUpPasskeyLoading(true)
    let challenge = await passkeyConnector.getCaptchaChallenge()
    try {
      await passkeyConnector.registerWithPasskey(name, {
        challengeKey: challenge.challenge_key, //TODO
        chars: "aaaaa",
      })
      send({
        type: "AUTHENTICATED",
      })
    } catch (e) {
      setSignUpPasskeyError((e as Error).message)
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
    data: anchorData,
    isLoading: isAnchorLoading,
    mutate: getAnchor,
  } = useSWR(
    `get-anchor`,
    () => {
      return {
        anchor: "123123",
        captcha:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABQCAIAAADTD63nAAAEfElEQVR4nO2d3ZKkIAyFtWvf/5XdC2tdBcQI+TmJ+a6menqAhGMIEZ1127YlSbj5WQ8giUkprHVdm9+7+zxJmpTC2rZt19C6rmcx7Z/7lZffkfvi8PNvuXH6tm2FmI5P1EbJCOzIQUbFNYxDM+uevO/teknkj2Gr/aFc4zhD4tXApePOOETtHyC1RfxDq5BxybE63bPkWIxhH1BVyzVDleul7q7/HZOIoB2HWKZ25ipkuYL7Vuy/NYnx9E6lIze08Y/tLHahi7gMmbh3oblFVls2cRIsYxuAaAK4pXLDgzY78Uve0hkEpP4ESwprEO+3Imp4bcmlMPkPY8rFELFmlM51lUSKHDFgENbMbTiuW3iAtwLRxkOBXgN7tI4nxwKcV3MC+6Q+oFADkWOBF3uGiWoXBYhdYVTve7drJuJCCCuZpxbB/EI8s5pfhBU1J9DEyoe1CFiSvOGgWx6bSW3dMe8Zad82tSXaY4fbM+8I4IxkIXum8zWFYj1OVtfIsXC0hTOSnflp6zw3IGGpofcc7Id9bdpnRitxjNjKew52hWhxSw7Xz0EVeAoGXkALsSbjcRCxJIgRFYjkUqiH6IojMZHuroQHYbmzJyrucq8HYbmzh46caes/JBqXQGKoz0thbG2xt3kuGfD6TS5VkphirP2LHGpPmvt6C4Yc0ZL3zu0U3jsq/XbcrYbsRBNWP6ozvsjgsaP9ByttmWs6mrA0ifcEGCMNYbnwVD9aHL9VOKlS9FK8b8xq68PY79jF007e8TNQ+m0KhRsayjuDHeVXkry1sb0UWr1UaWfy2JM+OpHp7dS+msHzbqNpyFtJIOZYvJN0F5LZN25qlyL7ZV/U3lj8jygsIjPORV7lCzQD8yHZeW2BCktn4l3Iq957Cm1FixA+qS1QYUlzTiZm3KcTTs5rn9xGoW5zphceYeHk0R3qQbKcYVezfTvB3vLCPYl/WFo5/OticalBO/OpD7v5Xh06JgUhAaUua7zmWGh1LOshKEH3uaqwzKXwHQWYoyos9sqnuVK/Bt3n2kuhXFU9RQaFQY719h4WvdnU1hkhbxCnDz15fyUXype/Iz5bb7wTltXRIsrXiIW0TwW2R2Plziq+LsAg12yQxwYOu+vQl0Iiruv+CLC77rWwMCfvUwucC4JErASNOMLKoGVI7fnMdvn5ZsJXWJ3CkuKz8tpN/p0/Uh6BZnf62D7pZMVh8u/8kfK5/ZCPEcezaIxyKcwa4zyOFkG56W78AwGJbj6F4ZP1Z2yf+41TbkCjvkQ7Uygxu0TRCGkrhaVHZwqFZpe4/kj0nsJSBWGJbGJ/rzCZ5G4KYTU3hqywYtTGNB9J1elogLdOkBWWSW2s/51IUUGTt1MpXnlXvgqJZyZ527QFs858qY/ZVvYYi3XsdT/8ujFaVbbhL0Mn4s9fQqT9H1b1xxEGwFXJBKxyA3g2Q6E2wbtFY2AJawkRLwOYMA+csJpMXvS27+wLEIYHxo8orOar96zmRvCRTj9qG/A/orDYZTTZ4PxZ0OafB4hkHf4Ck/gw9aR51zkAAAAASUVORK5CYII=",
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  )

  const [captchaToValidate, setCaptchaToValidate] = useState("")

  const { data: isCaptchaValid, isLoading: isCaptchaValidating } = useSWR(
    captchaToValidate ? `validate-captcha` : null,
    () => {
      return true
    },
    {
      revalidateOnFocus: false,
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
          onPasskeyCreate={onSignUpWithPasskey}
          isPasskeyCreating={signUpPasskeyLoading}
          createPasskeyError={signUpPasskeyError}
          getAnchor={() => {
            setCaptchaToValidate("")
            getAnchor()
          }}
          anchor={anchorData?.anchor}
          isLoading={isAnchorLoading}
          captcha={anchorData?.captcha}
          withLogo={!isIdentityKit}
          title={isIdentityKit ? "Sign up" : undefined}
          subTitle={isIdentityKit ? "to continue to" : "Sign up to continue to"}
          onBack={() => {
            send({ type: "BACK" })
            setSignUpPasskeyError("")
            setCaptchaToValidate("")
          }}
          validateCaptcha={setCaptchaToValidate}
          captchaIsValid={isCaptchaValid}
          captchaIsValidating={isCaptchaValidating}
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
