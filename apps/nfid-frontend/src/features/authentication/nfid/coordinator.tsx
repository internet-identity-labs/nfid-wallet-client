import { useMachine } from "@xstate/react"
import React from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useAuthentication } from "frontend/apps/authentication/use-authentication"
import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { BlurredLoader } from "@nfid-frontend/ui"

import AuthenticationCoordinator from "../root/coordinator"
import { AuthenticationMachineActor } from "../root/root-machine"
import NFIDAuthMachine from "./nfid-machine"

export default function NFIDAuthCoordinator() {
  const [state] = useMachine(NFIDAuthMachine)
  const navigate = useNavigate()
  const location = useLocation()
  const atEnd = state.matches("End")
  const authSession = state.context.authSession
  const { isAuthenticated } = useAuthentication()

  const rootAuthActor = state.children.AuthenticationMachine as
    | AuthenticationMachineActor
    | undefined
  const rootSnapshot = rootAuthActor?.getSnapshot?.()
  const isInEmailFlow =
    !!rootSnapshot?.matches?.("EmailAuthentication") ||
    !!rootSnapshot?.matches?.("SignUpWithEmail")

  React.useEffect(() => {
    if ((!isAuthenticated || isInEmailFlow) && !(atEnd && authSession)) return

    const target = `${ProfileConstants.base}/${ProfileConstants.tokens}`
    if (location.pathname === target) return

    navigate(target)
  }, [
    navigate,
    location.pathname,
    atEnd,
    authSession,
    isAuthenticated,
    isInEmailFlow,
  ])

  switch (true) {
    case state.matches("AuthenticationMachine"):
      return (
        <AuthenticationCoordinator
          actor={
            state.children.AuthenticationMachine as AuthenticationMachineActor
          }
        />
      )
    default:
      return <BlurredLoader isLoading />
  }
}
