import { useMachine } from "@xstate/react"
import React from "react"
import { useNavigate } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { AuthSelection } from "frontend/features/authentication/auth-selection"
import { AuthEmailFlowCoordinator } from "frontend/features/authentication/email-flow/coordination"
import { AuthWithEmailActor } from "frontend/features/authentication/email-flow/machine"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import AuthenticationMachine from "./machine"

export default function AuthenticationCoordinator({
  shouldRedirectToProfile = false,
}) {
  const [state, send] = useMachine(AuthenticationMachine, {
    context: { shouldRedirectToProfile },
  })
  const navigate = useNavigate()

  React.useEffect(
    () =>
      console.debug("AuthenticationCoordinator", {
        context: state?.context,
        state: state.value,
      }),
    [state.value, state.context],
  )

  React.useEffect(() => {
    if (!state.context.shouldRedirectToProfile) return
    if (state.value === "End" && state.context.authSession) {
      navigate(`${ProfileConstants.base}/${ProfileConstants.assets}`)
    }
  }, [
    navigate,
    state.context.authSession,
    state.context.shouldRedirectToProfile,
    state.value,
  ])

  switch (true) {
    case state.matches("AuthSelection"):
      return (
        <AuthSelection
          onSelectGoogleAuthorization={({ credential }) => {
            send({
              type: "AUTH_WITH_GOOGLE",
              data: { jwt: credential },
            })
          }}
          onSelectEmailAuthorization={(email: string) =>
            send({
              type: "AUTH_WITH_EMAIL",
              data: email,
            })
          }
          appMeta={state.context.appMeta}
        />
      )
    case state.matches("EmailAuthentication"):
      return (
        <AuthEmailFlowCoordinator
          actor={state.children.AuthWithEmailMachine as AuthWithEmailActor}
        />
      )
    case state.matches("End"):
    case state.matches("AuthWithGoogle"):
    default:
      return <BlurredLoader isLoading />
  }
}
