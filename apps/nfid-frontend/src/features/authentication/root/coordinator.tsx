import { useActor } from "@xstate/react"
import { AnimatePresence, motion } from "framer-motion"
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
  const [signUpWithPassKeyError, setSignUpWithPasskeyError] = useState("")

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

  const onSignUpWithPasskey = async ({
    walletName,
    challengeKey,
    enteredCaptcha,
  }: {
    walletName: string
    challengeKey: string
    enteredCaptcha?: string
  }) => {
    setSignUpPasskeyLoading(true)
    try {
      const response = await passkeyConnector.registerWithPasskey(walletName, {
        challengeKey,
        chars: enteredCaptcha,
      })
      send({
        type: "AUTHENTICATED",
        data: response,
      })
    } catch (e) {
      const msg = (e as Error).message
      if (msg.includes("Incorrect captcha key"))
        return setSignUpWithPasskeyError("Captcha expired. Please try again.")
      if (msg.includes("Incorrect captcha solution"))
        return setSignUpWithPasskeyError(
          "Incorrect captcha entered. Please try again.",
        )
      if (msg.includes("either timed out or was not allowed")) {
        toaster.error("Action was aborted. Please try again.")
        return
      }
      return setSignUpWithPasskeyError(
        "We ran into a hiccup. Give it another shot",
      )
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

  const walletName =
    state.context.email ??
    state.context.authSession?.name ??
    state.context.authSession?.anchor

  const renderAuthSteps = () => {
    switch (true) {
      case state.matches("AuthSelection"):
        return (
          <motion.div
            key="AuthSelection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
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
          </motion.div>
        )
      case state.matches("AuthSelectionSignUp"):
        return (
          <motion.div
            key="AuthSelectionSignUp"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
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
          </motion.div>
        )
      case state.matches("SignUpPassKey"):
        return (
          <motion.div
            key="SignUpPassKey"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            <AuthSignUpPassKey
              onPasskeyCreate={onSignUpWithPasskey}
              clearError={() => setSignUpWithPasskeyError("")}
              isPasskeyCreating={signUpPasskeyLoading}
              getCaptcha={passkeyConnector.getCaptchaChallenge}
              withLogo={!isIdentityKit}
              title={isIdentityKit ? "Sign up" : undefined}
              subTitle={
                isIdentityKit ? "to continue to" : "Sign up to continue to"
              }
              onBack={() => {
                send({ type: "BACK" })
                setSignUpWithPasskeyError("")
              }}
              createPasskeyError={signUpWithPassKeyError}
              applicationURL={state.context.authRequest?.hostname}
            />
          </motion.div>
        )
      case state.matches("SignUpWithEmail"):
        return (
          <motion.div
            key="EmailAuthentication"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            <AuthEmailFlowCoordinator
              isIdentityKit={isIdentityKit}
              actor={state.children.AuthWithEmailMachine as AuthWithEmailActor}
            />
          </motion.div>
        )
      case state.matches("EmailAuthentication"):
        return (
          <motion.div
            key="EmailAuthentication"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            <AuthEmailFlowCoordinator
              isIdentityKit={isIdentityKit}
              actor={state.children.AuthWithEmailMachine as AuthWithEmailActor}
            />
          </motion.div>
        )
      case state.matches("SignInWithRecoveryPhrase"):
        return (
          <motion.div
            key="SignInWithRecoveryPhrase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
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
          </motion.div>
        )
      case state.matches("BackupWallet"):
        return (
          <motion.div
            key="BackupWallet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            <AuthBackupWallet
              name={walletName}
              onSkip={() => send({ type: "SKIP" })}
              onCreate={() => send({ type: "DONE" })}
              titleClassName={isIdentityKit ? "lg:text-[28px]" : undefined}
            />
          </motion.div>
        )
      case state.matches("BackupWalletSavePhrase"):
        return (
          <motion.div
            key="BackupWalletSavePhrase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            <AuthSaveRecoveryPhrase
              name={walletName}
              onDone={() => {
                securityConnector
                  .createRecoveryPhrase(recoveryPhrase)
                  .then(() => {
                    send({ type: "DONE" })
                  })
              }}
              recoveryPhrase={recoveryPhrase}
              titleClassName={isIdentityKit ? "lg:text-[28px]" : undefined}
            />
          </motion.div>
        )
      case state.matches("OtherSignOptions"):
        return (
          <motion.div
            key="OtherSignOptions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
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
          </motion.div>
        )
      case state.matches("TwoFA"):
        return (
          <motion.div
            key="TwoFA"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            <Auth2FA
              email={state.context.email2FA}
              isIdentityKit={isIdentityKit}
              handleAuth={handle2FAAuth}
              isLoading={is2FALoading}
            />
          </motion.div>
        )
      case state.matches("AddPasskeys"):
        return (
          <motion.div
            key="AddPasskeys"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
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
          </motion.div>
        )
      case state.matches("AddPasskeysSuccess"):
        return (
          <motion.div
            key="AddPasskeysSuccess"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            <AuthAddPasskeySuccess
              onFinish={() => {
                send({ type: "DONE" })
              }}
              name={walletName}
              titleClassName={isIdentityKit ? "lg:text-[28px]" : undefined}
            />
          </motion.div>
        )
      case state.matches("End"):
      default:
        return loader || <BlurredLoader isLoading />
    }
  }

  return <AnimatePresence mode="wait">{renderAuthSteps()}</AnimatePresence>
}
