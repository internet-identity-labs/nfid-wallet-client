import { useMachine } from "@xstate/react"
import React from "react"
import { useNavigate } from "react-router-dom"

import { ProfileConstants } from "frontend/apps/identity-manager/profile/routes"
import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import AuthenticationCoordinator from "../root/coordinator"
import { AuthenticationMachineActor } from "../root/root-machine"
import NFIDAuthMachine from "./nfid-machine"

export default function NFIDAuthCoordinator() {
  const [state] = useMachine(NFIDAuthMachine)
  const navigate = useNavigate()

  React.useEffect(() => {
    if (state.value === "End" && state.context?.authSession) {
      navigate(`${ProfileConstants.base}/${ProfileConstants.assets}`)
    }
  }, [navigate, state.context?.authSession, state.value])

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
