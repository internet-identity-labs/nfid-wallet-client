import { useActor } from "@xstate/react"
import { AuthSelection } from "packages/ui/src/organisms/authentication/auth-selection"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import useSWR from "swr"

import { Button, IconCmpGoogle } from "@nfid-frontend/ui"
import {
  authenticationTracking,
  loadProfileFromLocalStorage,
} from "@nfid/integration"

import { AuthEmailFlowCoordinator } from "frontend/features/authentication/auth-selection/email-flow/coordination"
import { AuthWithEmailActor } from "frontend/features/authentication/auth-selection/email-flow/machine"
import { fetchProfile } from "frontend/integration/identity-manager"
import { AbstractAuthSession } from "frontend/state/authentication"
import {
  LoginEventHandler,
  SignInWithGoogle,
} from "frontend/ui/atoms/button/signin-with-google"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { Auth2FA } from "../../../../../../packages/ui/src/organisms/authentication/2fa"
import { AuthOtherSignOptions } from "../../../../../../packages/ui/src/organisms/authentication/other-sign-options.tsx"
import { authWithAnchor } from "../auth-selection/other-sign-options/services"
import { passkeyConnector } from "../auth-selection/passkey-flow/services"
import { AuthenticationMachineActor } from "./root-machine"

export default function AuthenticationCoordinator({
  actor,
}: {
  actor: AuthenticationMachineActor
}) {
  const [state, send] = useActor(actor)
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false)
  const [is2FALoading, setIs2FALoading] = React.useState(false)
  const [isOtherOptionsLoading, setIsOtherOptionsLoading] =
    React.useState(false)
  const { data: profile } = useSWR("profile", fetchProfile)
  const { register, handleSubmit } = useForm<{
    userNumber: number
  }>({
    defaultValues: {
      userNumber: loadProfileFromLocalStorage()?.anchor ?? undefined,
    },
  })

  // Track on unmount
  React.useEffect(() => {
    return () => {
      // NOTE: If we are on the root page (https://nfid.one/), unmounting means
      // the user is send to the NFID Profile App.
      // We don't want to track this when the user is on 3rd party authentication flow
      window.location.pathname === "/" && authenticationTracking.userSendToApp()
    }
  }, [])

  const handleAuth2FAMount = () => {
    authenticationTracking.loaded2fa()
  }

  const onSelectGoogleAuth: LoginEventHandler = ({ credential }) => {
    authenticationTracking.initiated({
      authSource: "google",
    })
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
      authenticationTracking.initiated(
        {
          authLocation: "magic",
          authSource: "passkey",
        },
        true,
      )
      const res = await passkeyConnector.loginWithAllowedPasskey(
        state.context.allowedDevices,
      )
      onSuccess(res)
    } catch (e: any) {
      toast.error(e?.message ?? "Invalid Passkey")
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
        toast.error(e.message)
      } finally {
        setIsOtherOptionsLoading(false)
      }
    },
    [send],
  )

  const onLoginWithPasskey = async () => {
    authenticationTracking.initiated({
      authSource: "passkey - continue",
    })
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
          onSelectEmailAuth={(email: string) => {
            authenticationTracking.initiated({
              authSource: "email",
            })
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
          actor={state.children.AuthWithEmailMachine as AuthWithEmailActor}
        />
      )
    case state.matches("OtherSignOptions"):
      return (
        <AuthOtherSignOptions
          appMeta={state.context?.appMeta}
          onBack={() => send({ type: "BACK" })}
          handleAuth={handleOtherOptionsAuth}
          formMethods={{ register, handleSubmit }}
          isLoading={isOtherOptionsLoading}
        />
      )
    case state.matches("TwoFA"):
      return (
        <Auth2FA
          appMeta={state.context?.appMeta}
          handleAuth={handle2FAAuth}
          isLoading={is2FALoading}
          email={profile?.email}
          onMounted={handleAuth2FAMount}
        />
      )
    case state.matches("End"):
    case state.matches("AuthWithGoogle"):
    default:
      return <BlurredLoader isLoading />
  }
}
