import { useActor } from "@xstate/react"
import toaster from "packages/ui/src/atoms/toast"
import {
  LoginEventHandler,
  SignInWithGoogle,
} from "packages/ui/src/molecules/button/signin-with-google"
import { Auth2FA } from "packages/ui/src/organisms/authentication/2fa"
import { AuthSelection } from "packages/ui/src/organisms/authentication/auth-selection"
import { AuthOtherSignOptions } from "packages/ui/src/organisms/authentication/other-sign-options.tsx"
import React, { useState } from "react"

import { Button, IconCmpGoogle } from "@nfid-frontend/ui"

import { AuthEmailFlowCoordinator } from "frontend/features/authentication/auth-selection/email-flow/coordination"
import { AuthWithEmailActor } from "frontend/features/authentication/auth-selection/email-flow/machine"
import { useLoadProfileFromStorage } from "frontend/hooks"
import { AbstractAuthSession } from "frontend/state/authentication"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { authWithAnchor } from "../auth-selection/other-sign-options/services"
import { passkeyConnector } from "../auth-selection/passkey-flow/services"
import { AuthenticationMachineActor } from "./root-machine"

export default function AuthenticationCoordinator({
  actor,
  isIdentityKit = false,
  loader,
}: {
  actor: AuthenticationMachineActor
  isIdentityKit?: boolean
  loader?: React.ReactNode
}) {
  const { storageProfile, storageProfileLoading } = useLoadProfileFromStorage()
  const [state, send] = useActor(actor)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)
  const [is2FALoading, setIs2FALoading] = React.useState(false)
  const [isOtherOptionsLoading, setIsOtherOptionsLoading] =
    React.useState(false)

  const onSelectGoogleAuth: LoginEventHandler = ({ credential }) => {
    send({
      type: "AUTH_WITH_GOOGLE",
      data: { jwt: credential },
    })
  }

  const onAuthWithPasskey = (authSession: AbstractAuthSession) => {
    send({ type: "AUTHENTICATED", data: authSession })
  }

  const handle2FAAuth = React.useCallback(async () => {
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

  const handleOtherOptionsAuth = React.useCallback(
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

  const onLoginWithPasskey = async () => {
    setIsPasskeyLoading(true)
    const res = await passkeyConnector.loginWithPasskey(undefined, () => {
      setIsPasskeyLoading(false)
    })

    onAuthWithPasskey(res)
  }

  switch (true) {
    case state.matches("AuthSelection"):
      return (
        <AuthSelection
          isIdentityKit={isIdentityKit}
          onSelectEmailAuth={(email: string) => {
            send({
              type: "AUTH_WITH_EMAIL",
              data: email,
            })
          }}
          onSelectOtherAuth={() => {
            send({
              type: "AUTH_WITH_OTHER",
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
    case state.matches("End"):
    case state.matches("AuthWithGoogle"):
    default:
      return loader || <BlurredLoader isLoading />
  }
}
