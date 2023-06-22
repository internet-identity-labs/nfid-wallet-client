import { useActor } from "@xstate/react"

import { BlurredLoader } from "frontend/ui/molecules/blurred-loader"

import { AuthWithEmailActor } from "./email-flow/machine"
import { AuthEmailVerified } from "./email-flow/ui/magic-link-verified"
import { AuthEmailPending } from "./email-flow/ui/pending-verification"

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
    case state.matches("EmailVerified"):
      return (
        <AuthEmailVerified
          onContinue={() => send({ type: "CONTINUE_VERIFIED" })}
        />
      )
    default:
      return <BlurredLoader isLoading />
  }
}
