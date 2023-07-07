import { useActor } from "@xstate/react"
import React from "react"

import { AuthSelection } from "frontend/features/authentication/auth-selection"
import { AuthEmailFlowCoordinator } from "frontend/features/authentication/auth-selection/email-flow/coordination"
import { AuthWithEmailActor } from "frontend/features/authentication/auth-selection/email-flow/machine"
import { AbstractAuthSession } from "frontend/state/authentication"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

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
          appMeta={state.context?.appMeta}
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
        />
      )
    case state.matches("End"):
    case state.matches("AuthWithGoogle"):
    default:
      return <BlurredLoader isLoading />
  }
}
