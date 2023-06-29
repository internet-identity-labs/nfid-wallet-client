import { useActor } from "@xstate/react"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthEmailVerified } from "./email-verified"
import { AuthWithEmailActor } from "./machine"
import { AuthEmailPending } from "./pending-verification"

interface AuthEmailFlowCoordinatorProps {
  actor: AuthWithEmailActor
}
export function AuthEmailFlowCoordinator({
  actor,
}: AuthEmailFlowCoordinatorProps) {
  const [state, send] = useActor(actor)

  console.debug("AuthEmailFlowCoordinator", {
    context: state.context,
    state: state.value,
  })

  switch (true) {
    case state.matches("SendVerificationEmail"):
      return <BlurredLoader isLoading />
    case state.matches("PendingEmailVerification"):
      return (
        <AuthEmailPending
          email={state.context.email}
          onBack={() => send({ type: "BACK" })}
          onResend={() => send({ type: "RESEND" })}
        />
      )
    case state.matches("Authenticated"):
      return (
        <AuthEmailVerified
          onContinue={() => send({ type: "CONTINUE_VERIFIED" })}
        />
      )
    default:
      return <BlurredLoader isLoading />
  }
}
