import { useMachine } from "@xstate/react"
import React from "react"
import { useNavigate } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { AuthSelection } from "frontend/features/authentication/auth-selection"
import { AuthEmailFlowCoordinator } from "frontend/features/authentication/email-flow/coordination"
import { AuthWithEmailActor } from "frontend/features/authentication/email-flow/machine"
import { AbstractAuthSession } from "frontend/state/authentication"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import AuthenticationMachine, { AuthenticationMachineActor } from "./machine"
import { AuthOtherSignOptions } from "./other-sign-options"

export default function AuthenticationCoordinator({
  actor,
  isNFID = false,
}: {
  isNFID?: boolean
  actor?: AuthenticationMachineActor
}) {
  const [state, send] = useMachine(AuthenticationMachine, {
    context: { isNFID },
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
    if (!state.context.isNFID) return
    if (state.value === "End" && state.context.authSession) {
      navigate(`${ProfileConstants.base}/${ProfileConstants.assets}`)
    }
  }, [navigate, state.context.authSession, state.context.isNFID, state.value])

  switch (true) {
    case state.matches("AuthSelection"):
      return (
        <AuthSelection
          onSelectEmailAuth={(email: string) =>
            send({
              type: "AUTH_WITH_EMAIL",
              data: email,
            })
          }
          onSelectGoogleAuth={({ credential }) => {
            send({
              type: "AUTH_WITH_GOOGLE",
              data: { jwt: credential },
            })
          }}
          onSelectOtherAuth={() =>
            send({
              type: "AUTH_WITH_OTHER",
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
    case state.matches("OtherSignOptions"):
      return (
        <AuthOtherSignOptions
          appMeta={state.context.appMeta}
          onBack={() => send({ type: "BACK" })}
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
