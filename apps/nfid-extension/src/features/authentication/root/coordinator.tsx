import { useActor } from "@xstate/react"
import { decodeJwt } from "jose"
import toaster from "packages/ui/src/atoms/toast"
import { Auth2FA } from "packages/ui/src/organisms/authentication/2fa"
import { AuthAddPasskey } from "packages/ui/src/organisms/authentication/auth-add-passkey"
import { AuthAddPasskeySuccess } from "packages/ui/src/organisms/authentication/auth-add-passkey/success"
import { AuthSelection } from "packages/ui/src/organisms/authentication/auth-selection"
import { AuthOtherSignOptions } from "packages/ui/src/organisms/authentication/other-sign-options.tsx"
import { ReactNode, useCallback, useState } from "react"
import browser from "webextension-polyfill"

import { Button, IconCmpGoogle } from "@nfid-frontend/ui"
import { getAllWalletsFromThisDevice } from "@nfid/integration"

import { AuthEmailFlowCoordinator } from "frontend/features/authentication/auth-selection/email-flow/coordination"
import { AuthWithEmailActor } from "frontend/features/authentication/auth-selection/email-flow/machine"
import { useLoadProfileFromStorage } from "frontend/hooks"
import { AbstractAuthSession } from "frontend/state/authentication"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { TokenLaunch } from "../3rd-party/choose-account/token-launch"
import { SignInWithGoogle } from "../../../components/google-btn"
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
  const { storageProfile, storageProfileLoading } = useLoadProfileFromStorage()
  const [state, send] = useActor(actor)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)
  const [is2FALoading, setIs2FALoading] = useState(false)
  const [isOtherOptionsLoading, setIsOtherOptionsLoading] = useState(false)
  const [isAddPasskeyLoading, setIsAddPasskeyLoading] = useState(false)

  const onSelectGoogleAuth = (accessToken: string) => {
    send({
      type: "AUTH_WITH_GOOGLE",
      data: {
        jwt: accessToken,
        email: decodeJwt(accessToken).email as string,
        isEmbed,
      },
    })
  }

  const onAuthWithPasskey = (authSession: AbstractAuthSession) => {
    send({ type: "AUTHENTICATED", data: authSession })
  }

  const handle2FAAuth = useCallback(async () => {
    setIs2FALoading(true)
    const onSuccess = (authSession: AbstractAuthSession) =>
      send({ type: "AUTHENTICATED", data: authSession })
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
          send({ type: "AUTHENTICATED", data: authSession })
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

    const response = await browser.runtime.sendMessage<{
      action: string
      allowedPasskeys?: Array<unknown>
    }>({ action: "passkeyAuth", allowedPasskeys: [] })

    setIsPasskeyLoading(false)

    onAuthWithPasskey(response as any)
  }

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
          appMeta={state.context?.appMeta}
          authRequest={state.context.authRequest}
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
        />
      )
    case state.matches("EmailAuthentication"):
      return (
        <AuthEmailFlowCoordinator
          isIdentityKit={isIdentityKit}
          actor={state.children.AuthWithEmailMachine as AuthWithEmailActor}
        />
      )
    case state.matches("OtherSignOptions"):
      return (
        <AuthOtherSignOptions
          withLogo={!isIdentityKit}
          title={isIdentityKit ? "Sign in" : undefined}
          subTitle={isIdentityKit ? "to continue to" : undefined}
          appMeta={state.context.authRequest?.hostname}
          onBack={() => send({ type: "BACK" })}
          handleAuth={handleOtherOptionsAuth}
          isLoading={isOtherOptionsLoading || storageProfileLoading}
          profileAnchor={storageProfile?.anchor}
        />
      )
    case state.matches("TwoFA"):
      return (
        <Auth2FA
          email={state.context.email2FA}
          isIdentityKit={isIdentityKit}
          appMeta={state.context?.appMeta}
          handleAuth={handle2FAAuth}
          isLoading={is2FALoading}
        />
      )
    case state.matches("AddPasskeys"):
      return (
        <AuthAddPasskey
          isLoading={isAddPasskeyLoading}
          email={state.context.email}
          onSkip={() => send({ type: "SKIP" })}
          onAdd={() => {
            setIsAddPasskeyLoading(true)
            passkeyConnector
              .createCredential({ isMultiDevice: false })
              .then(() => send({ type: "CONTINUE" }))
              .catch(() => send({ type: "BACK" }))
              .finally(() => setIsAddPasskeyLoading(false))
          }}
        />
      )
    case state.matches("AddPasskeysSuccess"):
      return (
        <AuthAddPasskeySuccess
          onFinish={() => {
            send({ type: "DONE" })
          }}
          email={state.context.email}
        />
      )
    case state.matches("SNSBanner"):
      return (
        <TokenLaunch
          onSubmit={() =>
            send({ type: "AUTHENTICATED", data: state.context.authSession })
          }
        />
      )
    case state.matches("End"):
    default:
      return loader || <BlurredLoader isLoading />
  }
}
