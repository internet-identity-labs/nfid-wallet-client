import { useActor } from "@xstate/react"
import React from "react"

import { authenticationTracking } from "@nfid/integration"

import { AuthSelection } from "frontend/features/authentication/auth-selection"
import { AuthEmailFlowCoordinator } from "frontend/features/authentication/auth-selection/email-flow/coordination"
import { AuthWithEmailActor } from "frontend/features/authentication/auth-selection/email-flow/machine"
import { AbstractAuthSession } from "frontend/state/authentication"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { Auth2FA } from "../auth-selection/2fa"
import { AuthOtherSignOptions } from "../auth-selection/other-sign-options"
import { AuthenticationMachineActor } from "./root-machine"

export default function AuthenticationCoordinator({
  actor,
}: {
  actor: AuthenticationMachineActor
}) {
  const [state, send] = useActor(actor)

  React.useEffect(
    () =>
      console.debug("AuthenticationCoordinator", {
        context: state?.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  // Track on unmount
  React.useEffect(() => {
    return () => {
      // NOTE: If we are on the root page (https://nfid.one/), unmounting means
      // the user is send to the NFID Profile App.
      // We don't want to track this when the user is on 3rd party authentication flow
      window.location.pathname === "/" && authenticationTracking.userSendToApp()
    }
  }, [])

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
          onSelectGoogleAuth={({ credential }) => {
            authenticationTracking.initiated({
              authSource: "google",
            })
            send({
              type: "AUTH_WITH_GOOGLE",
              data: { jwt: credential },
            })
          }}
          onSelectOtherAuth={() => {
            send({
              type: "AUTH_WITH_OTHER",
            })
          }}
          onAuthWithPasskey={(authSession: AbstractAuthSession) => {
            send({ type: "AUTHENTICATED", data: authSession })
          }}
          appMeta={state.context?.appMeta}
          authRequest={state.context.authRequest}
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
          onSuccess={(authSession: AbstractAuthSession) =>
            send({ type: "AUTHENTICATED", data: authSession })
          }
          authRequest={state.context.authRequest}
        />
      )
    case state.matches("TwoFA"):
      return (
        <Auth2FA
          allowedDevices={state.context?.allowedDevices}
          appMeta={state.context?.appMeta}
          onSuccess={(authSession: AbstractAuthSession) =>
            send({ type: "AUTHENTICATED", data: authSession })
          }
        />
      )
    case state.matches("End"):
    case state.matches("AuthWithGoogle"):
    default:
      return <BlurredLoader isLoading />
  }
}
